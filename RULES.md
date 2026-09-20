# RULES.md — IdeaPulse

**Business Logic & Enforcement Specification**
Version 1.0 · Effective from cycle 1 · Every rule here is enforced in PostgreSQL

---

## 0. How to read this document

Each rule carries an ID (`BR-###`), a plain-language statement, the exact enforcement mechanism, the error code returned on violation, and the message shown to the user.

**Enforcement class** tells you where the rule lives:

| Class          | Meaning                                           | Can a determined user bypass it?                                               |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------------ |
| **STRUCTURAL** | A `CHECK`, `UNIQUE`, or `FOREIGN KEY` constraint  | No. Bypass requires a schema change.                                           |
| **PROCEDURAL** | A `BEFORE` trigger or `SECURITY DEFINER` function | No, for any path that writes through Postgres.                                 |
| **POLICY**     | A Row Level Security policy                       | No, for any path using the `anon` or `authenticated` role.                     |
| **ADVISORY**   | Client-side validation                            | Yes. Exists only for fast feedback and is always paired with one of the above. |

A rule enforced only as ADVISORY is a bug. Every rule below has a non-advisory class.

**The user-facing `/rules` page is generated from this document.** When a rule changes here, it changes there, with an effective-from date.

---

## 1. Identity & eligibility

### BR-001 — An account is required to write

Reading is open to everyone. Voting, submitting, and reporting require an authenticated account.

- **Class:** POLICY — every `INSERT` policy requires `auth.uid()` to be non-null.
- **Error:** `IP_UNAUTHENTICATED`
- **Message:** "Sign in to vote." (The intended action is replayed after sign-in.)

### BR-002 — Email confirmation gates all writes

An account must have a confirmed email before it can vote, submit, or report.

- **Class:** PROCEDURAL — `account_is_writable()` joins `auth.users` and requires `email_confirmed_at is not null`.
- **Error:** `IP_ACCOUNT_NOT_WRITABLE` with `reason: 'unconfirmed'`
- **Message:** "Confirm your email to start voting. Resend the link →"
- **Rationale:** Email confirmation is the cheapest barrier that meaningfully raises the cost of a sockpuppet farm.

### BR-003 — Votes become verified after 24 hours of account age

A vote cast from an account less than 24 hours old is recorded and displayed, but marked `is_verified = false` and excluded from the qualification count.

- **Class:** PROCEDURAL — `voter_is_verified()` is evaluated at insert time and frozen onto the vote row.
- **Error:** none — the vote succeeds.
- **Message:** "Your vote is counted. Votes from accounts under 24 hours old become verified at 14:20 UTC tomorrow." _(Note: verification status is frozen at the moment of casting. A vote cast at hour 23 stays unverified even after the account matures. This is deliberate — it removes any incentive to create an account, vote immediately, and wait.)_
- **Rationale:** A sockpuppet ring must be created a full day before the votes it casts have any effect, which gives detection a window.

### BR-004 — Suspended accounts cannot write, and their active-cycle votes are de-verified

When an account is suspended, all of its votes in the currently active cycle flip to `is_verified = false` and affected counters recompute.

- **Class:** PROCEDURAL — admin action calls a suspension function; the counter trigger fires on `is_verified` change.
- **Error:** `IP_ACCOUNT_NOT_WRITABLE` with `reason: 'suspended'`
- **Message:** "This account is suspended until {date}. Contact support if you think this is a mistake."
- **Scope:** Votes in _already finalized_ cycles are not touched. Finalized results are immutable (see BR-047).

### BR-005 — Role escalation is impossible from the client

A user cannot set their own `role` or `status`.

- **Class:** POLICY + column grant — `authenticated` holds `UPDATE` on only `display_name`, `bio`, `avatar_url`, `username`.
- **Error:** `42501` insufficient privilege.

---

## 2. Voting

### BR-010 — Five votes per rolling 24 hours

A user may cast at most 5 votes in any rolling 24-hour window. The window is continuous, not a calendar day — it never resets at midnight.

- **Class:** PROCEDURAL (`cast_vote` advisory-locked count) + POLICY (`votes_self_insert` subquery).
- **Parameter:** `cycles.daily_vote_limit`, default `5`. Tunable per cycle without a deploy.
- **Error:** `IP_VOTE_QUOTA:<next_slot_timestamp>`
- **Message:** "You've used all 5 votes. Your next vote unlocks in 3h 41m."

**Mechanics — worked example.** A user votes at these times:

| #   | Time (UTC) | Votes used in window           | Result                                      |
| --- | ---------- | ------------------------------ | ------------------------------------------- |
| 1   | Mon 09:00  | 1                              | ✅                                          |
| 2   | Mon 09:04  | 2                              | ✅                                          |
| 3   | Mon 13:30  | 3                              | ✅                                          |
| 4   | Mon 21:15  | 4                              | ✅                                          |
| 5   | Mon 23:50  | 5                              | ✅                                          |
| 6   | Tue 00:05  | 5 in window                    | ❌ `IP_VOTE_QUOTA`, next slot **Tue 09:00** |
| 6′  | Tue 09:01  | vote #1 aged out → 4 in window | ✅                                          |

The "next slot" timestamp is always `min(created_at of votes in window) + 24h`. It is computed server-side and returned in the error so the UI never has to guess.

**Why rolling, not calendar.** A calendar reset creates a stampede at midnight and lets a user cast 10 votes in a few minutes by straddling the boundary (5 at 23:58, 5 at 00:01). A rolling window makes the budget genuinely constant.

### BR-011 — One vote per user per idea, permanently

A user may vote on a given idea exactly once. Retracting does not restore the ability to vote on that idea again.

- **Class:** STRUCTURAL — `UNIQUE (idea_id, voter_id)` on `votes`.
- **Error:** `IP_DUPLICATE_VOTE`
- **Message:** "You've already voted on this idea."
- **Quota effect:** A rejected duplicate consumes no quota.

### BR-012 — Self-voting is forbidden

A user may never vote on an idea they authored.

- **Class:** STRUCTURAL — `CHECK (voter_id <> idea_author_id)` on `votes`, backed by a composite foreign key `(idea_id, idea_author_id) → ideas(id, author_id)` that makes a forged `idea_author_id` value impossible.
- **Also enforced:** PROCEDURAL (early check in `cast_vote` for a good error message), POLICY (`votes_self_insert`), ADVISORY (button disabled).
- **Error:** `IP_SELF_VOTE`
- **Message:** "You can't vote on your own idea."
- **Design note:** The composite FK is the whole point. Without the denormalized `idea_author_id` column, self-vote prevention would require a subquery, which Postgres forbids in `CHECK`, leaving only a trigger — and triggers can be disabled, forgotten in a migration, or bypassed by `ALTER TABLE ... DISABLE TRIGGER`. A `CHECK` constraint cannot be bypassed by anything short of altering the schema.

### BR-013 — Votes cannot be cast on non-published ideas

Withdrawn, under-review, and removed ideas are unvotable.

- **Class:** PROCEDURAL + POLICY.
- **Error:** `IP_IDEA_CLOSED`
- **Message:** "Voting is closed on this idea." (Sub-message varies: "The author withdrew it." / "It's under review.")

### BR-014 — Retraction has a 10-minute window and never refunds quota

A vote may be retracted within 10 minutes of being cast. The retracted vote stops counting toward the idea's total, but the quota slot it consumed remains consumed for the full 24 hours.

- **Class:** POLICY (`votes_self_retract` with a `created_at > now() - interval '10 minutes'` predicate) + PROCEDURAL (`retract_vote`).
- **Error:** `IP_RETRACTION_WINDOW_CLOSED`
- **Message:** "Votes can only be taken back within 10 minutes. This one is locked in."
- **Rationale:** Retraction exists to fix misclicks. If it refunded quota, a user could vote, retract, vote, retract — turning 5 votes into unlimited exploration of the feed, and letting a coordinated group shuttle votes between ideas to dodge detection. The quota counts _votes cast_, not _votes currently standing_. The quota query therefore counts `status in ('active','retracted')`.

### BR-015 — Voided votes do not count and do not refund

An admin may void a vote (ring-voting, suspended account, duplicate identity). A voided vote is excluded from all counts. The voter's quota is not refunded.

- **Class:** POLICY (`votes_admin_all`) + PROCEDURAL (counter trigger).
- **Audit:** Every void writes an `admin_actions` row with a mandatory reason.

### BR-016 — Votes belong to the cycle that was active when they were cast

Cycle membership is resolved server-side via `active_cycle_id()` at insert time and never recomputed.

- **Class:** PROCEDURAL + POLICY (`cycle_id = active_cycle_id()` in the insert check).
- **Edge case:** A vote submitted at 23:59:59.8 on the boundary belongs to the closing cycle if the transaction's `now()` falls inside the old window. There is no ambiguity because both the cycle lookup and the insert happen in one transaction.

### BR-017 — The vote ledger is append-only and private

No client may delete a vote. No client may read another user's votes.

- **Class:** POLICY (`votes_self_read`) + revoked `DELETE` grant.
- **Public surface:** Aggregate counts only, through `idea_public_stats`.
- **Rationale:** A public vote ledger enables reciprocal-voting enforcement between colluding users ("I can see you didn't vote for mine"). Keeping it private removes the mechanism.

---

## 3. Idea submission

### BR-020 — One idea per rolling 7 days

A user may publish one idea per rolling 168-hour window, measured from the `created_at` of their most recent submission.

- **Class:** PROCEDURAL — `enforce_submission_rules()` trigger with an advisory lock.
- **Parameter:** `cycles.submission_cooldown`, default `interval '7 days'`.
- **Error:** `IP_SUBMIT_COOLDOWN:<next_slot_timestamp>`
- **Message:** "You've used this week's submission. Your next slot opens Thursday 14 March at 09:12 UTC."

**Why rolling and not cycle-aligned.** Cycle-aligned quotas ("one per cycle") create a submission stampede in the first hour of every cycle, because posting early maximizes voting time. A rolling window spreads submissions across the week, which keeps the feed alive on day 5 rather than only on day 1.

**Counted statuses.** `published`, `withdrawn`, and `under_review` all consume the slot. `removed` (moderator-removed for policy violation) also consumes it — being removed is not a way to get another attempt. See BR-024.

### BR-021 — Content bounds are enforced by the database

| Field    | Min | Max  | Constraint               |
| -------- | --- | ---- | ------------------------ |
| Title    | 10  | 120  | `ideas_title_len`        |
| Summary  | 40  | 280  | `ideas_summary_len`      |
| Body     | 100 | 5000 | `ideas_body_len`         |
| Tags     | 0   | 5    | `ideas_tags_limit`       |
| Category | 1   | 1    | `ideas_category_allowed` |

- **Class:** STRUCTURAL. Client-side `zod` schemas mirror these exactly and are generated from the same constants file so they cannot drift.
- **Error:** `IP_VALIDATION` with the failing field.

### BR-022 — An idea locks on its first vote

Once `vote_count > 0`, the title, summary, and body become immutable for the author.

- **Class:** PROCEDURAL — `guard_idea_immutability()` trigger checks `locked_at`.
- **Error:** `IP_IDEA_LOCKED`
- **Message:** "This idea is locked because people have already voted on it. Edits would change what they voted for."
- **Escape hatch:** Admins can edit a locked idea; the change is written to `admin_actions`.

### BR-023 — Withdrawal removes an idea from ranking but not from the ledger

An author may withdraw their idea before the cycle closes. Its votes remain in `votes` for audit purposes but the idea is excluded from the leaderboard and from reward qualification.

- **Class:** POLICY (`ideas_author_update` allows `published → withdrawn`).
- **Quota effect:** Withdrawal does **not** restore the weekly submission slot.
- **Message on confirm:** "Withdraw this idea? It leaves the leaderboard, keeps its 23 votes on record, and doesn't give back this week's submission slot. This can't be undone."

### BR-024 — Moderator removal consumes the slot and voids the votes

An idea removed for policy violation has all its votes voided and does not free the author's weekly slot.

- **Class:** POLICY (`ideas_admin_all`) + PROCEDURAL (cascade void).
- **Audit:** `admin_actions` row with a mandatory reason; the author is notified with the reason.

### BR-025 — Ideas belong to the cycle active at submission

Same mechanism and rationale as BR-016. An idea submitted on day 6 of a cycle competes in that cycle, with only one day of voting time. The trending sort compensates by decaying on age, not by re-homing late submissions.

---

## 4. Anti-cheat

### BR-030 — Layered enforcement

Every abuse vector is blocked at two or more layers. A single layer failing does not create an exploit.

| Vector                   | Layer 1                      | Layer 2                | Layer 3           |
| ------------------------ | ---------------------------- | ---------------------- | ----------------- |
| Self-vote                | `CHECK` constraint           | RPC guard              | RLS policy        |
| Duplicate vote           | `UNIQUE` constraint          | RPC guard              | UI state          |
| Over-quota vote          | Advisory lock + count in RPC | RLS policy subquery    | UI HUD            |
| Forged author ID         | Composite `FOREIGN KEY`      | RPC reads the real row | —                 |
| Over-quota submission    | Trigger + advisory lock      | —                      | UI cooldown panel |
| Client-set `is_verified` | Column grant revoked         | RPC computes it        | —                 |
| Vote deletion            | `DELETE` grant revoked       | Append-only design     | —                 |
| Privilege escalation     | Column grants on `profiles`  | RLS `WITH CHECK`       | —                 |

### BR-031 — Concurrency cannot produce over-quota writes

Two simultaneous vote requests from the same user are serialized by `pg_advisory_xact_lock(hashtextextended(voter_id::text, 0))` held for the duration of the transaction.

- **Failure mode without the lock:** Both transactions read "4 votes used", both pass the check, both insert. Result: 6 votes in the window.
- **With the lock:** The second transaction blocks until the first commits, then reads "5 used" and is rejected.
- **Test requirement:** An integration test fires 20 concurrent vote requests against 20 distinct ideas from one account and asserts exactly 5 rows in `votes`.

### BR-032 — Rate limiting sits in front of the quota

Quotas are business rules; rate limits are infrastructure protection. Both exist.

| Endpoint        | Limit        | Window     | Key             |
| --------------- | ------------ | ---------- | --------------- |
| `cast_vote`     | 30 requests  | 1 minute   | user ID         |
| `submitIdea`    | 5 requests   | 10 minutes | user ID         |
| `/login`        | 6 attempts   | 15 minutes | IP hash + email |
| `/register`     | 3 accounts   | 1 hour     | IP hash         |
| Anonymous reads | 300 requests | 1 minute   | IP hash         |

- **Class:** Edge middleware (Upstash Redis or Vercel KV) + Supabase Auth built-in limits.
- **Error:** `IP_RATE_LIMITED` with `Retry-After`.
- **Note:** A rate-limit trip writes an `abuse_events` row of kind `rate_limit_tripped`. Repeated trips are a detection signal, not just a nuisance.

### BR-033 — Verified vote count is the only count that matters for rewards

Two counts are maintained and both are displayed:

- `vote_count` — every active vote. This is the social number shown on the card.
- `verified_vote_count` — votes from accounts that were confirmed, ≥ 24h old, and in good standing when the vote was cast. **This is the number compared against the threshold.**

The UI shows the raw count prominently and the verified count on the idea detail page alongside the qualification bar. When the two differ by more than 10%, the detail page states it plainly: "47 votes · 38 verified toward the 50 needed."

- **Rationale:** Hiding the distinction invites accusations of a hidden algorithm. Showing it makes gaming visible to everyone, including the person being gamed against.

### BR-034 — Ring-voting detection

A nightly job computes, for each pair of accounts, the Jaccard overlap of the idea sets they voted on within the cycle. Pairs exceeding the thresholds below are written to a review queue. **No automatic punishment occurs** — the output is a human review task.

| Signal                                                  | Threshold                    | Weight |
| ------------------------------------------------------- | ---------------------------- | ------ |
| Vote-set overlap between two accounts                   | ≥ 0.80 over ≥ 8 shared votes | High   |
| Accounts created within 30 minutes of each other        | —                            | Medium |
| Shared `ip_hash` on registration                        | —                            | Medium |
| Votes cast within 120 seconds of each other, repeatedly | ≥ 5 occurrences              | High   |
| All of an account's votes going to one author           | ≥ 4 votes, 1 author          | High   |

Two High signals, or one High plus two Medium, promote the cluster to `priority_review`.

- **Human step required:** An admin reviews, then either dismisses or suspends with a written reason. The suspension de-verifies active-cycle votes per BR-004.
- **Rationale:** Automated bans on a correlation signal will eventually ban a study group, a startup team, or a family. The cost of a false positive here is a lost user and a public complaint; the cost of a 24-hour delay is one contested cycle.

### BR-035 — No raw IP storage

Registration and abuse events store `sha256(ip || daily_salt)` where `daily_salt` rotates every 24 hours and is held outside the database.

- **Effect:** Same-day correlation is possible; long-term tracking of an individual is not.
- **Retention:** `abuse_events` rows are purged after 180 days.

### BR-036 — Abuse events are recorded, not just rejected

Every rejected write produces an `abuse_events` row with the actor, kind, error code, and structured detail. A rejection that is not logged is a missed signal.

- **Exception:** `IP_VALIDATION` failures (a title that's too short) are not abuse and are not logged.

### BR-037 — Reports require three distinct reporters to act

A single report does nothing visible. Three reports from three distinct accounts move an idea to `under_review`, which freezes voting and hides it from the feed pending moderator decision.

- **Class:** PROCEDURAL — trigger on `reports` insert counts distinct reporters.
- **Abuse of reporting:** Accounts whose reports are dismissed at a rate above 80% over ≥ 5 reports lose the ability to report.

---

## 5. Cycles

### BR-040 — A cycle runs 7 days, Monday 00:00 UTC to Monday 00:00 UTC

- **Class:** PROCEDURAL — `pg_cron` job `ideapulse-rotate-cycle` at `0 0 * * 1`.
- **Display:** All cycle times are shown in the viewer's local timezone with the UTC offset stated, e.g. "Closes Mon 00:00 UTC (Sun 20:00 your time)".

### BR-041 — Exactly one cycle is active at any time

- **Class:** STRUCTURAL — a partial unique index on `cycles(status) WHERE status = 'active'`.
- **Failure mode covered:** A retried cron job cannot open a second active cycle.

### BR-042 — Rotation is atomic: close, then open

`rotate_cycle()` calls `finalize_cycle()` and `open_next_cycle()` in one transaction. If finalization fails, no new cycle opens and the old one stays `active` — a visible failure rather than a silent gap.

- **Alert:** If no cycle transition is observed within 30 minutes of the boundary, an alert fires.

### BR-043 — Writes during rotation are rejected, briefly

While a cycle has status `closing`, `active_cycle_id()` returns null and writes fail with `IP_NO_ACTIVE_CYCLE`.

- **Expected duration:** Under 2 seconds.
- **Message:** "The weekly cycle is closing right now. Try again in a moment."
- **Client behavior:** Automatic retry after 3 seconds, once.

---

## 6. Reward qualification

### BR-045 — Qualification requires 50 verified votes

An idea qualifies for a reward when its `verified_vote_count` reaches the active cycle's `vote_threshold` (default 50) before the cycle closes.

- **Class:** PROCEDURAL — the counter trigger sets `qualified_at` on the crossing.
- **Parameter:** `cycles.vote_threshold`, per cycle.
- **Not qualifying is not failing.** The UI language is "needs 12 more votes to qualify", never "failed".

### BR-046 — Ranking and tie-breaking

Qualifying ideas are ranked by:

1. `verified_vote_count` descending
2. `qualified_at` ascending — the idea that crossed the threshold first wins the tie
3. `created_at` ascending — as a final, deterministic fallback

- **Rationale for tie-break 2:** Rewarding earlier momentum is the fairest available signal, and `qualified_at` is a single stored timestamp rather than a recomputation over the ledger, so the result is reproducible years later.
- **Reward slots:** `cycles.reward_slots`, default 3. If only two ideas qualify, only two rewards are created. Slots are a cap, not a quota to fill.

### BR-047 — Finalized cycles are immutable

Once a cycle is `finalized`, its rewards, ranks, and vote counts are frozen.

- **If a vote in a finalized cycle is later voided:** the cycle status becomes `recount_required` and an admin must explicitly decide whether to re-rank. The system never silently rewrites history.
- **Public display:** A `recount_required` cycle shows a banner explaining that results are under review, with the original standings still visible.

### BR-048 — Zero qualifying ideas is a valid outcome

If no idea reaches the threshold, the cycle finalizes with zero rewards and a public note: "No idea reached the 50-vote threshold this cycle."

- **Anti-pattern explicitly rejected:** Lowering the threshold retroactively to manufacture a winner. The threshold for a cycle is fixed at the moment the cycle opens and is displayed on the leaderboard throughout.
- **Operator response:** Adjust `vote_threshold` for the _next_ cycle, and say so publicly.

### BR-049 — Withdrawn and removed ideas cannot qualify

Only `status = 'published'` ideas are considered at finalization, regardless of vote count.

### BR-050 — An author may hold at most one reward per cycle

If two of an author's ideas both qualify — possible only if a prior cycle's idea is still accumulating votes, which the cycle scoping prevents — only the higher-ranked one receives a reward slot.

- **Class:** STRUCTURAL — `UNIQUE (cycle_id, idea_id)` plus a finalization-time filter on `recipient_id`.

---

## 7. Error code reference

| Code                          | HTTP | Cause                     | User message                                                                  |
| ----------------------------- | ---- | ------------------------- | ----------------------------------------------------------------------------- |
| `IP_UNAUTHENTICATED`          | 401  | No session                | Sign in to vote.                                                              |
| `IP_ACCOUNT_NOT_WRITABLE`     | 403  | Unconfirmed or suspended  | Confirm your email to start voting. / This account is suspended until {date}. |
| `IP_SELF_VOTE`                | 403  | BR-012                    | You can't vote on your own idea.                                              |
| `IP_DUPLICATE_VOTE`           | 409  | BR-011                    | You've already voted on this idea.                                            |
| `IP_VOTE_QUOTA`               | 429  | BR-010                    | You've used all 5 votes. Your next vote unlocks in {duration}.                |
| `IP_SUBMIT_COOLDOWN`          | 429  | BR-020                    | You've used this week's submission. Your next slot opens {datetime}.          |
| `IP_IDEA_CLOSED`              | 409  | BR-013                    | Voting is closed on this idea.                                                |
| `IP_IDEA_LOCKED`              | 409  | BR-022                    | This idea is locked because people have already voted on it.                  |
| `IP_IDEA_NOT_FOUND`           | 404  | Bad ID                    | That idea doesn't exist.                                                      |
| `IP_RETRACTION_WINDOW_CLOSED` | 409  | BR-014                    | Votes can only be taken back within 10 minutes.                               |
| `IP_VOTE_NOT_FOUND`           | 404  | No active vote to retract | There's no vote here to take back.                                            |
| `IP_NO_ACTIVE_CYCLE`          | 503  | BR-043                    | The weekly cycle is closing right now. Try again in a moment.                 |
| `IP_CYCLE_ALREADY_FINALIZED`  | 409  | BR-047                    | This cycle is already closed.                                                 |
| `IP_RATE_LIMITED`             | 429  | BR-032                    | Too many requests. Try again in {seconds}s.                                   |
| `IP_VALIDATION`               | 422  | BR-021                    | Field-specific inline message.                                                |

**Message principles:** state what happened, state what to do, never apologize, never say "something went wrong", always link to the governing rule.

---

## 8. Rule change policy

1. Parameters (`vote_threshold`, `daily_vote_limit`, `submission_cooldown`, `reward_slots`) are per-cycle columns. Changing them takes effect for the **next** cycle only.
2. A parameter change is announced in-app for 7 days before it takes effect.
3. Structural rules (self-voting, one-vote-per-idea, append-only ledger) require a migration, a version bump on this document, and a changelog entry in `MEMORY.md`.
4. No rule change is ever applied retroactively to a finalized cycle.

---

## 9. Verification checklist

Every rule must have a passing test before launch.

- [ ] BR-010 — 6th vote in 24h rejected; next-slot timestamp correct to the second
- [ ] BR-010 — vote aged past 24h reclaims a slot
- [ ] BR-011 — second vote on the same idea rejected, no quota consumed
- [ ] BR-012 — self-vote rejected via RPC
- [ ] BR-012 — self-vote rejected via direct PostgREST insert with a forged `idea_author_id`
- [ ] BR-012 — self-vote rejected with triggers disabled (proves the `CHECK` is load-bearing)
- [ ] BR-014 — retraction inside 10 min succeeds; quota still consumed
- [ ] BR-014 — retraction after 10 min rejected
- [ ] BR-020 — second submission inside 7 days rejected with the correct next-slot time
- [ ] BR-020 — withdrawing does not restore the slot
- [ ] BR-022 — author edit after first vote rejected
- [ ] BR-031 — 20 concurrent votes from one account produce exactly 5 rows
- [ ] BR-033 — vote from a 23-hour-old account is unverified and excluded from the threshold
- [ ] BR-041 — running `open_next_cycle()` twice fails on the unique index
- [ ] BR-045 — `qualified_at` set exactly once, on the crossing vote
- [ ] BR-046 — tie resolved by `qualified_at`
- [ ] BR-048 — cycle with no qualifiers finalizes cleanly with a note
- [ ] RLS — user A cannot read user B's votes
- [ ] RLS — user cannot set their own role to admin
- [ ] RLS — anonymous client cannot insert into any table
