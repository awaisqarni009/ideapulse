# PRD.md — IdeaPulse

**Product Requirements Document**
Version 1.0 · Status: Approved for build · Owner: Product & Architecture

---

## 1. Vision

IdeaPulse is a community idea incubator where the crowd — not a committee — decides which ideas deserve funding and attention.

Anyone can post one idea per week. Anyone can spend five votes per day. Every seven days the platform closes a cycle, counts the verified votes, and pays out rewards to the ideas that crossed the qualification bar. The scarcity of votes is the product: when a person only has five votes to give, each one carries real signal, and the leaderboard stops being a popularity contest between whoever has the biggest mailing list.

**One-line positioning:** Product Hunt's discovery loop, with hard anti-abuse rules and a weekly payout instead of a permanent ranking.

### 1.1 Problem statement

Idea-sharing communities decay in three predictable ways:

1. **Vote inflation.** Unlimited voting means the ranking measures reach, not quality. The first hundred voters set the outcome and everyone after them follows the crowd.
2. **Submission spam.** Without a submission cap, a handful of prolific users flood the feed and drown out occasional contributors.
3. **Ring voting.** Sockpuppets, self-votes, and reciprocal vote trading make any reward system a target within days of launch.

IdeaPulse treats all three as first-class product constraints enforced at the database layer, not as moderation chores bolted on after launch.

### 1.2 Product principles

| #   | Principle                  | What it means in practice                                                                                              |
| --- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| P1  | Scarcity creates signal    | 5 votes / 24h, 1 idea / week. Non-negotiable, visible in the UI at all times.                                          |
| P2  | Rules live in the database | Every quota and abuse rule is a constraint, trigger, or RLS policy. The client is never the enforcement point.         |
| P3  | The cycle is the heartbeat | Everything resets weekly. Users always know where they are in the cycle and how long they have.                        |
| P4  | Transparency over mystery  | Users can see their remaining votes, their cooldown timer, their idea's rank, and why a vote was rejected.             |
| P5  | Motion explains state      | Animation confirms what changed — a vote landing, a rank shifting, a cycle closing. Never decoration for its own sake. |

### 1.3 Goals

- **G1** — Ship a public beta with auth, submission, voting, leaderboard, and a finalized reward cycle within 8 weeks.
- **G2** — Zero successful self-votes or duplicate votes in production, verified by audit query.
- **G3** — Median time from landing page to first vote cast under 90 seconds for a new user.
- **G4** — At least 40% of registered users cast at least one vote in their first week (activation rate).
- **G5** — Run entirely inside Supabase free-tier limits and Vercel's hobby/pro tier for the beta.

### 1.4 Non-goals (v1)

- Real-money payouts or payment processing. Rewards in v1 are recorded, ranked, and announced; fulfillment is manual and off-platform.
- Comments, threaded discussion, or direct messaging.
- Teams, organizations, or multi-author ideas.
- Native mobile apps. The web app is responsive; that is the mobile story for v1.
- Editing an idea after it has received its first vote.
- Public API for third parties.

### 1.5 Success metrics

| Metric                | Definition                                               | v1 target            |
| --------------------- | -------------------------------------------------------- | -------------------- |
| Activation rate       | Registered users who cast ≥1 vote within 7 days          | ≥ 40%                |
| Submission conversion | Registered users who post ≥1 idea in their first 14 days | ≥ 12%                |
| Vote utilization      | Mean daily votes cast per active voter (max 5)           | ≥ 3.2                |
| Qualification rate    | Ideas per cycle reaching the 50-vote threshold           | 3–10                 |
| Abuse rejection rate  | Vote attempts blocked by anti-abuse rules                | < 2% of all attempts |
| Cycle finalization    | Cycles closed and ranked without manual intervention     | 100%                 |
| p95 leaderboard TTFB  | Server response for `/leaderboard`                       | < 400 ms             |

---

## 2. User personas

### Persona A — "Maya", the Builder

- **Age / role:** 27, front-end developer at a mid-size SaaS company, builds side projects on weekends.
- **Goal:** Find out whether an idea is worth three months of her evenings before she spends them.
- **Behavior:** Writes carefully, posts once, refreshes the leaderboard obsessively for the first 48 hours.
- **Frustrations:** Communities where the vote count is meaningless because everyone upvotes everything. Feedback that arrives as "cool idea!" and nothing else.
- **What IdeaPulse gives her:** A submission slot that is scarce enough to be taken seriously, and a vote count she can trust because votes are rationed.
- **Key journey:** Register → read the rules → draft and submit → watch rank in real time → qualify for a reward.

### Persona B — "Dev", the Curator

- **Age / role:** 34, product manager, reads more than he writes.
- **Goal:** Spend his five daily votes well and feel like his judgment moved the outcome.
- **Behavior:** Opens the feed daily, sorts by "newest", votes 3–5 times, rarely submits.
- **Frustrations:** Infinite feeds with no sense of when voting matters. Not knowing if his vote counted.
- **What IdeaPulse gives him:** A visible vote budget, a daily reset timer, and a weekly cycle that gives his votes a deadline.
- **Key journey:** Log in → check remaining votes → browse feed → vote → see the quota counter decrement → return tomorrow.

### Persona C — "Sam", the Skeptic

- **Age / role:** 41, engineering lead, has watched three communities die to spam.
- **Goal:** Confirm the platform isn't gameable before investing attention.
- **Behavior:** Reads the rules page first. Tests the edge cases — tries to self-vote, tries to double-vote, tries a second submission.
- **Frustrations:** Hand-wavy "we have anti-spam measures" claims.
- **What IdeaPulse gives him:** A public, explicit rules page, a visible verified-vote count distinct from raw votes, and clear rejection messages when he probes a limit.
- **Key journey:** Land → read `/rules` → register → probe limits → get precise, non-hostile rejections → stay.

### Persona D — "Admin", the Operator (internal)

- **Role:** Platform operator, one or two people.
- **Goal:** Close each cycle cleanly, investigate flagged accounts, publish reward results.
- **Needs:** A cycle dashboard, an abuse event log, the ability to void a vote or suspend an account with an audit trail.
- **Constraint:** Must never be able to silently alter vote counts — every admin action is logged.

---

## 3. Feature breakdown

Features are identified `F-##`. Priority: **M** = MVP / must ship, **S** = should ship v1, **C** = could ship, deferred if time-constrained.

### 3.1 Identity & accounts

| ID   | Feature                        | Priority | Description                                                                                                                                        |
| ---- | ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-01 | Email + password registration  | M        | Supabase Auth, email confirmation required before any write action.                                                                                |
| F-02 | OAuth sign-in (GitHub, Google) | S        | Reduces friction; OAuth accounts still subject to the 24h account-age rule for verified votes.                                                     |
| F-03 | Profile creation trigger       | M        | A `profiles` row is created automatically on `auth.users` insert. Username is generated from email local-part, deduplicated with a numeric suffix. |
| F-04 | Profile editing                | S        | Display name, username (once per 30 days), bio (280 chars), avatar URL.                                                                            |
| F-05 | Public profile page            | S        | `/u/[username]` — submitted ideas, total votes received, cycles won, member since. Never shows what the user voted for.                            |
| F-06 | Session persistence & refresh  | M        | Supabase SSR cookie-based sessions; middleware refresh on every request.                                                                           |
| F-07 | Account deletion               | S        | Soft-deletes the profile, anonymizes the display name, keeps votes intact for ledger integrity.                                                    |

### 3.2 Idea submission

| ID   | Feature                 | Priority | Description                                                                                                                                               |
| ---- | ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-10 | Submission form         | M        | Title (10–120 chars), summary (40–280 chars), body (100–5000 chars, markdown subset), category (single select), tags (0–5).                               |
| F-11 | Weekly submission quota | M        | One published idea per rolling 168 hours, enforced by trigger.                                                                                            |
| F-12 | Draft autosave          | C        | Local-storage draft restored on return to the form.                                                                                                       |
| F-13 | Live preview            | S        | Side-by-side render of the markdown body as it is typed.                                                                                                  |
| F-14 | Edit window             | S        | Editable until the first vote lands, then locked. Title and body are frozen; typo-level edits require admin.                                              |
| F-15 | Withdraw idea           | S        | Author can withdraw before the cycle closes. Votes are retained in the ledger but excluded from ranking. Withdrawal does not restore the submission slot. |
| F-16 | Cooldown surface        | M        | If the slot is used, the form is replaced by a countdown to the exact timestamp the slot reopens.                                                         |

### 3.3 Voting

| ID   | Feature              | Priority | Description                                                                                                                                      |
| ---- | -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| F-20 | Cast vote            | M        | Single-action vote on an idea. One vote per user per idea, ever.                                                                                 |
| F-21 | Daily vote quota     | M        | 5 votes per rolling 24 hours. Server-authoritative.                                                                                              |
| F-22 | Quota HUD            | M        | Persistent header element: "3 of 5 votes left · resets in 4h 12m". Updates optimistically, reconciles from the server.                           |
| F-23 | Self-vote prevention | M        | Blocked at the database level by a `CHECK` constraint, not by application code.                                                                  |
| F-24 | Vote retraction      | S        | A vote can be retracted within 10 minutes. The quota slot is **not** refunded — retraction exists to correct mistakes, not to extend the budget. |
| F-25 | Optimistic UI        | M        | The vote button animates and the count increments immediately; a server rejection rolls it back with an inline reason.                           |
| F-26 | Rejection messaging  | M        | Distinct, human messages for each rejection cause (quota exhausted, already voted, own idea, account too new, idea closed, account suspended).   |

### 3.4 Discovery & leaderboard

| ID   | Feature                | Priority | Description                                                                                     |
| ---- | ---------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| F-30 | Idea feed              | M        | Infinite-scroll grid of glass cards. Sorts: Trending (default), Newest, Top this cycle.         |
| F-31 | Trending algorithm     | S        | `verified_votes / (hours_since_post + 2)^1.5` — a decay score that lets new ideas surface.      |
| F-32 | Category & tag filters | S        | Multi-select chips, reflected in the URL for shareable filtered views.                          |
| F-33 | Search                 | C        | Postgres full-text search across title, summary, and tags.                                      |
| F-34 | Live leaderboard       | M        | Top 20 ideas for the active cycle, ranked by verified votes. Realtime rank changes animate.     |
| F-35 | Cycle archive          | S        | `/cycles/[n]` — final standings and reward recipients for every closed cycle.                   |
| F-36 | Idea detail page       | M        | Full body, author card, vote button, verified vote count, qualification progress bar toward 50. |

### 3.5 Rewards & cycles

| ID   | Feature                 | Priority | Description                                                                           |
| ---- | ----------------------- | -------- | ------------------------------------------------------------------------------------- |
| F-40 | Weekly cycle engine     | M        | A scheduled job opens and closes cycles at a fixed UTC boundary.                      |
| F-41 | Cycle countdown         | M        | Global header countdown to the close of the active cycle.                             |
| F-42 | Qualification threshold | M        | An idea needs ≥ 50 verified votes in the cycle to be reward-eligible.                 |
| F-43 | Reward allocation       | M        | Ranked allocation among qualifying ideas. Ties broken by earliest 50th vote.          |
| F-44 | Results announcement    | S        | A cycle-close screen with the final standings and a one-time celebratory animation.   |
| F-45 | Reward claim flow       | C        | Winner confirms payout details; recorded as `claimed` with a manual fulfillment step. |

### 3.6 Trust, safety & admin

| ID   | Feature                     | Priority | Description                                                                                                                                     |
| ---- | --------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| F-50 | Abuse event log             | M        | Every rejected write is recorded with the reason, actor, and timestamp.                                                                         |
| F-51 | Verified vs raw vote counts | M        | A vote is _verified_ only if the voter's account is ≥ 24h old, confirmed, and not suspended. Only verified votes count toward the 50 threshold. |
| F-52 | Report an idea              | S        | Users flag an idea with a reason; three distinct reports move it to `under_review`.                                                             |
| F-53 | Admin cycle dashboard       | S        | Open/close cycles, view qualifying ideas, finalize rankings.                                                                                    |
| F-54 | Account suspension          | S        | Suspends writes and retroactively de-verifies the account's votes in the active cycle.                                                          |
| F-55 | Ring-voting detector        | C        | Flags clusters of accounts whose voting patterns overlap beyond a threshold, for human review.                                                  |

### 3.7 Platform & experience

| ID   | Feature                    | Priority | Description                                                                             |
| ---- | -------------------------- | -------- | --------------------------------------------------------------------------------------- |
| F-60 | Glassmorphic design system | M        | Implemented per `DESIGN.md` as tokens plus a component library.                         |
| F-61 | Responsive layout          | M        | 360px → 1920px, no horizontal scroll at any breakpoint.                                 |
| F-62 | Reduced-motion support     | M        | All non-essential animation disabled under `prefers-reduced-motion: reduce`.            |
| F-63 | Keyboard accessibility     | M        | Every interactive element reachable and operable by keyboard with a visible focus ring. |
| F-64 | Empty & error states       | M        | Every list, form, and page has a designed empty state and a designed failure state.     |
| F-65 | Realtime updates           | S        | Supabase Realtime pushes vote-count changes to open leaderboard and detail pages.       |

---

## 4. User stories & acceptance criteria

Acceptance criteria use Given/When/Then. Every criterion must be verifiable by an automated test or a documented manual check.

---

### US-01 — Register an account

> As a visitor, I want to create an account with my email so that I can post and vote.

**Acceptance criteria**

- **AC-01.1** — Given a visitor on `/register`, when they submit a valid email and a password of at least 10 characters, then an account is created and a confirmation email is sent.
- **AC-01.2** — Given a submitted registration, when the account is created, then a `profiles` row exists with a unique username derived from the email local-part.
- **AC-01.3** — Given a duplicate email, when the form is submitted, then the response is the same generic success message shown for a new address (no account enumeration), and no second account is created.
- **AC-01.4** — Given a password under 10 characters or missing a digit, when the form is submitted, then inline validation blocks submission and names the specific unmet requirement.
- **AC-01.5** — Given an unconfirmed account, when the user attempts to submit an idea or vote, then the action is rejected with "Confirm your email to start voting" and a resend link.

---

### US-02 — Sign in and stay signed in

> As a returning user, I want my session to persist so that I don't log in every visit.

- **AC-02.1** — Given valid credentials, when the user signs in, then they are redirected to the page they originally requested, or `/feed` if none.
- **AC-02.2** — Given a valid session cookie, when the user returns within 7 days, then they are recognized without re-entering credentials.
- **AC-02.3** — Given an expired access token and a valid refresh token, when any page is requested, then middleware refreshes the session transparently.
- **AC-02.4** — Given five failed sign-in attempts within 15 minutes, when a sixth is attempted, then it is rate-limited with a retry-after message.

---

### US-03 — Submit an idea

> As a builder, I want to post one idea per week so that the community can evaluate it.

- **AC-03.1** — Given a confirmed user with an unused weekly slot, when they submit a valid idea, then it is created with status `published` and attached to the active cycle.
- **AC-03.2** — Given a user who published an idea 3 days ago, when they open `/submit`, then the form is replaced by a countdown showing the exact date and time the slot reopens.
- **AC-03.3** — Given a user who bypasses the UI and calls the API directly within the cooldown, when the insert is attempted, then the database rejects it with error code `IP_SUBMIT_COOLDOWN` and an `abuse_events` row is written.
- **AC-03.4** — Given a title under 10 or over 120 characters, when submission is attempted, then it is rejected both client-side and by a database `CHECK` constraint.
- **AC-03.5** — Given a successful submission, when the response returns, then the user is redirected to the idea's detail page and a confirmation toast appears.
- **AC-03.6** — Given a submitted idea, when the author views it, then the vote button is visibly disabled with the label "You can't vote on your own idea".

---

### US-04 — Cast a vote

> As a curator, I want to vote on ideas I believe in so that the best ones get rewarded.

- **AC-04.1** — Given a confirmed user with votes remaining, when they vote on another user's idea, then the vote is recorded, the count increments, and the quota decrements by one.
- **AC-04.2** — Given a user who has already voted on that idea, when they vote again, then the request is rejected with `IP_DUPLICATE_VOTE` and no quota is consumed.
- **AC-04.3** — Given a user who has cast 5 votes in the last 24 hours, when they attempt a sixth, then it is rejected with `IP_VOTE_QUOTA` and the response includes the timestamp of the next available slot.
- **AC-04.4** — Given a user viewing their own idea, when a vote request is forged against it, then the database `CHECK` constraint rejects it with `IP_SELF_VOTE`.
- **AC-04.5** — Given a successful vote, when the server confirms it, then the button transitions to its voted state within 200 ms and the count animates from the old value to the new one.
- **AC-04.6** — Given a vote rejected by the server after optimistic UI applied it, when the error returns, then the count rolls back to the true value and an inline reason is shown — never a generic "something went wrong".
- **AC-04.7** — Given an account created less than 24 hours ago, when a vote is cast, then the vote is recorded but marked `is_verified = false` and does not count toward the 50-vote threshold, and the UI tells the user their votes become verified at a stated time.

---

### US-05 — Track my voting budget

> As a curator, I want to see how many votes I have left so that I can spend them deliberately.

- **AC-05.1** — Given an authenticated user on any page, when the header renders, then it shows remaining votes out of 5 and the time until the oldest vote ages out.
- **AC-05.2** — Given a vote is cast, when it succeeds, then the HUD decrements without a page reload.
- **AC-05.3** — Given the quota is exhausted, when the user hovers any vote button, then a tooltip states the exact time the next vote becomes available.
- **AC-05.4** — Given the rolling window advances past a prior vote, when the page is next loaded or the 60-second poll fires, then the reclaimed vote is reflected in the HUD.

---

### US-06 — Browse and filter the feed

> As a visitor, I want to browse ideas without an account so that I can decide whether to join.

- **AC-06.1** — Given an anonymous visitor, when they open `/feed`, then published ideas are visible with their vote counts.
- **AC-06.2** — Given an anonymous visitor, when they click a vote button, then a sign-in modal opens and the intended vote is replayed after successful authentication.
- **AC-06.3** — Given a selected sort, when the page reloads, then the sort persists via the URL query string.
- **AC-06.4** — Given the feed is scrolled to the bottom, when more ideas exist, then the next page loads via cursor pagination without duplicating or skipping rows.
- **AC-06.5** — Given no ideas match the active filters, when the feed renders, then a designed empty state appears with a one-click filter reset.

---

### US-07 — Follow the leaderboard

> As any user, I want to see which ideas are leading this cycle so that I know where the race stands.

- **AC-07.1** — Given an active cycle, when `/leaderboard` renders, then the top 20 ideas are listed by verified vote count, descending.
- **AC-07.2** — Given an idea with ≥ 50 verified votes, when it renders in the list, then it carries a "Qualified" badge.
- **AC-07.3** — Given an idea below 50, when it renders, then a progress bar shows current votes against the threshold with the remaining count stated numerically.
- **AC-07.4** — Given the page is open and a rank changes, when the realtime event arrives, then the affected rows reorder with a 320 ms spring transition and no full re-render.
- **AC-07.5** — Given `prefers-reduced-motion: reduce`, when ranks change, then rows reorder instantly with no transition.

---

### US-08 — Understand the rules

> As a skeptic, I want the rules stated plainly so that I can trust the outcome.

- **AC-08.1** — Given any visitor, when they open `/rules`, then vote quota, submission quota, self-vote prohibition, verification criteria, and the 50-vote threshold are all stated with exact numbers.
- **AC-08.2** — Given a rejected action anywhere in the app, when the error is shown, then it links to the specific rule that caused it.
- **AC-08.3** — Given a rule changes, when the rules page renders, then it displays an effective-from date and the change is announced in-app for 7 days.

---

### US-09 — Compete for a reward

> As a builder, I want my idea to qualify for a reward so that my work is recognized.

- **AC-09.1** — Given the active cycle closes, when finalization runs, then every idea with ≥ 50 verified votes is written to `rewards` with its rank.
- **AC-09.2** — Given no idea reaches 50 votes, when the cycle closes, then it is finalized with zero rewards and a public note explaining that the threshold was not met.
- **AC-09.3** — Given two ideas finish with identical verified vote counts, when ranks are assigned, then the idea that reached its 50th verified vote first ranks higher.
- **AC-09.4** — Given a cycle is finalized, when any vote for that cycle is later voided by an admin, then the cycle is marked `recount_required` and is not silently re-ranked.
- **AC-09.5** — Given a user whose idea won, when they next sign in, then a one-time result modal appears with the final rank and vote count.

---

### US-10 — Operate the platform

> As an admin, I want to manage cycles and investigate abuse so that results stay credible.

- **AC-10.1** — Given an admin on `/admin/cycles`, when they view the active cycle, then they see vote totals, qualifying ideas, and a flagged-account list.
- **AC-10.2** — Given an admin voids a vote, when the action completes, then the vote is marked `voided`, the idea's counter is recalculated, and an `admin_actions` row records the actor and reason.
- **AC-10.3** — Given a non-admin user, when they request any `/admin` route, then they receive a 404 (not a 403 — no admin surface disclosure).
- **AC-10.4** — Given an admin suspends an account, when the action completes, then that account's votes in the active cycle are de-verified and affected vote counts are recalculated.

---

## 5. Release plan

| Milestone            | Contents                                           | Exit criteria                                                                         |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **M1 — Foundation**  | Schema, RLS, auth, profiles                        | A user can register, confirm, and sign in. RLS denies all cross-user writes in tests. |
| **M2 — Core loop**   | Submission, voting, quotas, feed                   | All of US-03, US-04, US-05 pass. Abuse tests all rejected at DB level.                |
| **M3 — Competition** | Leaderboard, cycles, qualification, rewards        | A full cycle opens, runs, and finalizes automatically on staging.                     |
| **M4 — Polish**      | Design system, animation, empty/error states, a11y | Lighthouse ≥ 95 accessibility; reduced-motion verified.                               |
| **M5 — Launch**      | Admin tools, monitoring, production deploy         | Cycle finalized in production; abuse log empty of unexplained entries.                |

---

## 6. Risks & mitigations

| Risk                                              | Impact                                      | Likelihood     | Mitigation                                                                                                    |
| ------------------------------------------------- | ------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------- |
| Sockpuppet farms clear the 50-vote bar            | Reward integrity destroyed                  | Medium         | 24h account-age verification, email confirmation requirement, ring-detection review, admin void with recount. |
| Supabase free-tier limits hit at launch spike     | Outage during the moment that matters       | Medium         | Denormalized counters, cursor pagination, ISR on read-heavy pages, documented upgrade path.                   |
| Threshold of 50 is too high for a small community | Every cycle finalizes with zero rewards     | High at launch | Threshold stored as a per-cycle config column, tunable without a deploy. Seeded launch cohort.                |
| Scheduled cycle job fails silently                | Cycle never closes                          | Low            | Job writes a heartbeat row; an alert fires if no cycle transition occurs within 30 minutes of the boundary.   |
| Optimistic UI diverges from server truth          | Users distrust the counts                   | Medium         | Every optimistic action reconciles against the server response; realtime is the source of truth for counts.   |
| Clock/timezone confusion around cycle boundaries  | Disputes over which cycle a vote belongs to | Medium         | All timestamps `timestamptz` in UTC; cycle membership resolved server-side at write time, never client-side.  |

---

## 7. Open questions

| #   | Question                                                                        | Owner   | Needed by                                         |
| --- | ------------------------------------------------------------------------------- | ------- | ------------------------------------------------- |
| Q1  | Reward composition — cash, credits, or promotion?                               | Product | M3                                                |
| Q2  | Is the submission quota a rolling 168h or a calendar week aligned to the cycle? | Product | M2 — _decided: rolling 168h, see RULES.md BR-020_ |
| Q3  | Should retracted votes refund quota?                                            | Product | M2 — _decided: no, see RULES.md BR-014_           |
| Q4  | Do anonymous visitors see exact vote counts or rounded bands?                   | Product | M3 — _decided: exact counts_                      |
| Q5  | Multi-region cycle boundaries for a global audience?                            | Product | Post-v1                                           |
