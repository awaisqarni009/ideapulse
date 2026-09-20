# MEMORY.md — IdeaPulse

**Project Memory & Session Continuity**
Last updated: _(set on every session close)_ · Maintained by: whoever last touched the code

---

## 0. What this file is for

This is the file you read first when you return to the project after a week away, and the file you update last before you stop working. It answers four questions:

1. Where is the build right now?
2. What environment does it need to run?
3. What decisions are already made, and why — so they don't get relitigated?
4. What happened in the last few sessions?

If a fact lives in `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `DESIGN.md`, or `TASKS.md`, it does not get duplicated here. This file holds **state**, not specification.

---

## 1. Project status

| Field                | Value                                                                              |
| -------------------- | ---------------------------------------------------------------------------------- |
| **Current phase**    | Phase 1 — Database & security                                                      |
| **Phase progress**   | 22 / 34 tasks                                                                      |
| **Overall progress** | 39 / 178 tasks                                                                     |
| **Status**           | In progress — All 18 database migrations authored (schema, triggers, RLS, seed)    |
| **Blocked on**       | Nothing                                                                            |
| **Next action**      | T-1.23 — Write supabase/tests/rls.test.sql using pgTAP (Batch 5: T-1.23 to T-1.28) |
| **Target launch**    | TBD                                                                                |
| **Active branch**    | `main`                                                                             |
| **Last deploy**      | —                                                                                  |

### 1.1 Phase board

| Phase | Name                | Status         | Tasks | Exit gate met |
| ----- | ------------------- | -------------- | ----- | ------------- |
| 0     | Foundation          | 🟢 Complete    | 17/17 | ✅            |
| 1     | Database & security | 🟡 In progress | 22/34 | ❌            |
| 2     | Authentication      | ⬜ Not started | 0/16  | ❌            |
| 3     | Core loop           | ⬜ Not started | 0/25  | ❌            |
| 4     | Discovery           | ⬜ Not started | 0/18  | ❌            |
| 5     | Cycles & rewards    | ⬜ Not started | 0/13  | ❌            |
| 6     | Trust & admin       | ⬜ Not started | 0/14  | ❌            |
| 7     | Polish              | ⬜ Not started | 0/31  | ❌            |
| 8     | Launch              | ⬜ Not started | 0/31  | ❌            |

Legend: ⬜ not started · 🟡 in progress · 🟢 complete · 🔴 blocked

### 1.2 Environment status

| Environment | URL                     | Supabase project                | Status         |
| ----------- | ----------------------- | ------------------------------- | -------------- |
| Local       | `http://localhost:3000` | `supabase start` (local Docker) | Not configured |
| Preview     | `*.vercel.app`          | `ideapulse-staging`             | Not created    |
| Production  | _(domain TBD)_          | `ideapulse-prod`                | Not created    |

---

## 2. Environment variables

### 2.1 Reference

| Variable                        | Scope           | Required | Where it comes from              | Notes                                                                                                       |
| ------------------------------- | --------------- | -------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Client + Server | ✅       | Supabase → Settings → API        | Safe to expose                                                                                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | ✅       | Supabase → Settings → API        | Safe to expose. Security rests on RLS, not on this key being secret.                                        |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Server only** | ✅       | Supabase → Settings → API        | ⚠️ Bypasses all RLS. Never prefix with `NEXT_PUBLIC_`. Only used in `/api/cron/*` and admin route handlers. |
| `SUPABASE_JWT_SECRET`           | Server only     | ➖       | Supabase → Settings → API        | Only if verifying JWTs outside supabase-js                                                                  |
| `NEXT_PUBLIC_SITE_URL`          | Client + Server | ✅       | Your deployment                  | Used for auth redirect URLs. Must match Supabase's allowlist exactly.                                       |
| `CRON_SECRET`                   | Server only     | ✅       | Generate: `openssl rand -hex 32` | Shared secret on the cycle-rotation route handler                                                           |
| `IP_HASH_SALT_SEED`             | Server only     | ✅       | Generate: `openssl rand -hex 32` | Seed for the daily rotating salt in `ip_hash` (`RULES.md` BR-035)                                           |
| `UPSTASH_REDIS_REST_URL`        | Server only     | ➖       | Upstash console                  | Edge rate limiting (`RULES.md` BR-032)                                                                      |
| `UPSTASH_REDIS_REST_TOKEN`      | Server only     | ➖       | Upstash console                  | —                                                                                                           |
| `NEXT_PUBLIC_SENTRY_DSN`        | Client + Server | ➖       | Sentry project                   | Error tracking                                                                                              |
| `SENTRY_AUTH_TOKEN`             | Build only      | ➖       | Sentry                           | Source map upload                                                                                           |
| `NEXT_PUBLIC_POSTHOG_KEY`       | Client          | ➖       | PostHog                          | Product analytics, if used                                                                                  |
| `RESEND_API_KEY`                | Server only     | ➖       | Resend                           | Transactional email beyond Supabase Auth                                                                    |

### 2.2 `.env.local` template

```bash
# ─── Supabase ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ─── Site ────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ─── Secrets ─────────────────────────────────────────────────
CRON_SECRET=
IP_HASH_SALT_SEED=

# ─── Rate limiting (optional in dev) ─────────────────────────
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ─── Observability (optional in dev) ─────────────────────────
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

### 2.3 Rules

1. `.env.local`, `.env.production`, and every `.env*` except `.env.example` are gitignored. Verify before the first commit.
2. Any variable prefixed `NEXT_PUBLIC_` is compiled into the browser bundle. Treat it as published.
3. `SUPABASE_SERVICE_ROLE_KEY` must never appear in a client component, a `use client` file, or anything imported by one. Add an ESLint rule to enforce it.
4. Preview deployments point at the staging Supabase project. A preview branch must never be able to write to production data.
5. Rotate `CRON_SECRET` and `IP_HASH_SALT_SEED` if either is ever exposed in a log or a screenshot.

---

## 3. Architectural decisions

Each decision records the choice, the alternatives considered, and the reason. **Reopening a decision requires a new entry that supersedes the old one — never edit a decision in place.**

---

### ADR-001 — Business rules live in PostgreSQL, not the application

- **Status:** Accepted · 2026-01
- **Context:** Quotas and anti-abuse rules could be enforced in Next.js server actions, in the database, or both.
- **Decision:** Every rule is enforced in PostgreSQL as a constraint, trigger, or RLS policy. The application layer validates only to produce fast, specific error messages.
- **Alternatives:** (a) App-layer only — rejected: anyone with the anon key and `curl` bypasses it entirely. (b) App-layer with DB as a backstop — rejected as a primary model: two sources of truth drift, and the drift is silent.
- **Consequences:** More SQL to write and test. Error messages must be mapped from SQLSTATE codes. In exchange, there is no code path that can violate a rule.
- **Revisit if:** Rules become too dynamic to express in SQL — unlikely for quota arithmetic.

---

### ADR-002 — Self-voting prevented by a CHECK constraint via a denormalized author ID

- **Status:** Accepted · 2026-01
- **Context:** Postgres forbids subqueries in `CHECK` constraints, so `CHECK (voter_id <> (select author_id from ideas where id = idea_id))` is not expressible.
- **Decision:** `votes` carries a denormalized `idea_author_id` column with a composite foreign key `(idea_id, idea_author_id) → ideas(id, author_id)`, plus `CHECK (voter_id <> idea_author_id)`. This required adding `UNIQUE (id, author_id)` to `ideas` as the FK target.
- **Alternatives:** (a) A `BEFORE INSERT` trigger — rejected as the sole mechanism: triggers can be disabled with `ALTER TABLE ... DISABLE TRIGGER`, dropped by a careless migration, or bypassed by a `COPY`. (b) RLS policy only — rejected: `service_role` bypasses RLS entirely, so a bug in an admin script could insert a self-vote.
- **Consequences:** One redundant column. The composite FK makes forging `idea_author_id` impossible, because a mismatched pair has no matching row in `ideas`.
- **Do not remove `ideas_id_author_uk`.** It looks redundant next to the primary key and it is not.

---

### ADR-003 — Rolling windows for both quotas, not calendar resets

- **Status:** Accepted · 2026-01
- **Context:** The 5-vote and 1-submission quotas need a window definition.
- **Decision:** Both are rolling: 24 hours from each vote, 168 hours from each submission.
- **Alternatives:** Calendar day / calendar week — rejected because a user can straddle the boundary (5 votes at 23:58, 5 more at 00:01) and because a shared reset time creates a stampede.
- **Consequences:** The "next slot" time differs per user and must be computed server-side and returned in the error payload. The UI cannot derive it from a clock.

---

### ADR-004 — Retraction does not refund quota

- **Status:** Accepted · 2026-01
- **Context:** Should retracting a vote within the 10-minute window give the slot back?
- **Decision:** No. The quota counts votes _cast_, not votes _standing_. The quota query counts `status in ('active','retracted')`.
- **Rationale:** Refunding would let a user vote-retract-vote indefinitely, turning 5 votes into unlimited feed exploration, and would let a coordinated group shuttle votes between ideas to evade pattern detection. Retraction exists to fix a misclick, not to extend a budget.
- **Consequences:** The confirmation copy must be explicit about this, or it reads as a bug.

---

### ADR-005 — Vote verification is frozen at insert time

- **Status:** Accepted · 2026-01
- **Context:** A vote from an account under 24 hours old is unverified. Should it become verified once the account matures?
- **Decision:** No. `is_verified` is computed once, at insert, and changes only by admin action (suspension or void).
- **Rationale:** If unverified votes matured automatically, the optimal sockpuppet strategy would be: create accounts, vote immediately, wait 24 hours, collect the votes. Freezing means the ring must be created a full day _before_ it is useful, which gives detection a window.
- **Consequences:** The UI must explain this clearly to new users, or their first vote feels broken.

---

### ADR-006 — The vote ledger is private and append-only

- **Status:** Accepted · 2026-01
- **Context:** Should who-voted-for-what be public?
- **Decision:** No. RLS restricts `votes` reads to the voter and admins. Public surfaces expose aggregates only, via the `idea_public_stats` view. `DELETE` is revoked from all client roles.
- **Rationale:** A public ledger enables enforcement of reciprocal voting between colluding users — "I can see you didn't vote for mine." Privacy removes the enforcement mechanism, which removes much of the incentive to collude.
- **Consequences:** Realtime is enabled on `ideas` only, never on `votes`. "See who voted" is permanently off the roadmap.

---

### ADR-007 — Advisory locks for quota concurrency

- **Status:** Accepted · 2026-01
- **Context:** Two simultaneous vote requests from one user could both read "4 used" and both insert.
- **Decision:** `cast_vote` takes `pg_advisory_xact_lock(hashtextextended(voter_id::text, 0))` before the count. Submissions use the same pattern with a different key namespace.
- **Alternatives:** (a) `SERIALIZABLE` isolation — rejected: retry handling across the whole app for one hot path. (b) `SELECT ... FOR UPDATE` on the profile row — workable, but couples the vote path to profile-row contention. (c) A unique index on a generated bucket column — rejected: doesn't express a rolling window.
- **Consequences:** Lock contention is scoped to a single user, so it never blocks anyone else. Must be verified by a 20-concurrent-request test (T-1.30).

---

### ADR-008 — Denormalized counters over aggregate queries

- **Status:** Accepted · 2026-01
- **Context:** Vote counts appear on every card in the feed.
- **Decision:** `ideas.vote_count` and `ideas.verified_vote_count` are maintained by an `AFTER` trigger. Reads never aggregate over `votes`.
- **Alternatives:** `COUNT(*)` per card — rejected: N aggregate queries per feed page, and unusable on the free tier at any real traffic. A materialized view — rejected: refresh latency is visible in a product where the count is the point.
- **Consequences:** The counter trigger is the single most correctness-critical piece of SQL in the project. It must handle insert, retract, void, and `is_verified` change. It also owns `qualified_at`.

---

### ADR-009 — Cycle parameters stored per cycle, not in code

- **Status:** Accepted · 2026-01
- **Context:** The 50-vote threshold may be wrong for launch-scale traffic.
- **Decision:** `vote_threshold`, `daily_vote_limit`, `submission_cooldown`, and `reward_slots` are columns on `cycles`. `cast_vote` and `finalize_cycle` read them from the active cycle.
- **Consequences:** Tuning is a data change, not a deploy. A parameter is fixed for the life of a cycle and can never be changed retroactively (`RULES.md` BR-048). The `/rules` page must render live values, not hardcoded ones.

---

### ADR-010 — Dark-only, no light theme

- **Status:** Accepted · 2026-01
- **Context:** Should the glassmorphic system have a light variant?
- **Decision:** No. Dark only, v1.
- **Rationale:** Glassmorphism depends on luminance contrast between a translucent surface and a dark backdrop. A light variant is not a token swap; it is a second design system with different blur, border, and shadow behavior, and it doubles the accessibility audit surface.
- **Consequences:** `prefers-color-scheme: light` is ignored. Documented on the settings page so it doesn't read as an oversight.

---

### ADR-011 — Next.js App Router with Server Actions, not a separate API layer

- **Status:** Accepted · 2026-01
- **Context:** Mutations could go through route handlers, a tRPC layer, or Server Actions.
- **Decision:** Server Actions calling Supabase RPCs, with the user's cookie session. Route handlers only for cron and webhooks.
- **Rationale:** Server Actions do not escalate privilege — they carry the same anon key and user JWT the browser would. They exist for latency and to keep validation logic off the client, not as a trust boundary. This keeps RLS as the sole authorization mechanism on every path.
- **Consequences:** No public REST API in v1. Adding one later means adding a route handler layer with its own rate limiting.

---

### ADR-012 — Two typefaces, no monospace

- **Status:** Accepted · 2026-01
- **Context:** Vote counts and countdown timers need digits that don't shift width.
- **Decision:** Space Grotesk (display) + Geist Sans (body). Numeric alignment is solved with `font-variant-numeric: tabular-nums`, not by introducing a monospace face.
- **Rationale:** A mono face for small data labels is a recognizable generated-interface tell, and it costs a third font load for a problem an OpenType feature already solves.

---

## 4. Known issues & watchlist

| ID  | Issue        | Severity | Status | Notes |
| --- | ------------ | -------- | ------ | ----- |
| —   | _(none yet)_ | —        | —      | —     |

**Template:**

| `ISS-001` | Short description | 🔴 High / 🟡 Medium / 🟢 Low | Open / In progress / Fixed in `<commit>` | Repro steps, affected phase |

### 4.1 Standing watchlist

Things known to be fragile. Check these when something breaks.

1. **Counter trigger correctness** — if a vote count looks wrong, suspect `sync_vote_counters` first, especially around `is_verified` changes and `qualified_at`.
2. **`backdrop-filter` performance** — if scrolling degrades, count the blurred elements in the viewport before anything else.
3. **Cycle rotation** — if a cycle didn't close, check the `pg_cron` job log, then the heartbeat row, then whether `finalize_cycle` threw.
4. **Auth redirect URLs** — the single most common cause of a broken login after a deploy is `NEXT_PUBLIC_SITE_URL` not matching Supabase's allowlist.
5. **Type drift** — if `database.types.ts` is stale after a migration, TypeScript will pass while runtime fails. CI regenerates and diffs it.

---

## 5. Session changelog

Newest first. One entry per working session. Keep entries short — this is a log, not a report.

### Template

```markdown
### YYYY-MM-DD — Session NN

**Phase:** N — Name
**Duration:** Xh
**Tasks completed:** T-N.N, T-N.N
**Tasks started:** T-N.N

**What shipped**

- Concrete change, with the commit hash

**Decisions made**

- Any choice that will affect later work. Anything structural gets an ADR above.

**Blockers hit**

- What stopped progress and how it was resolved, or that it's still open

**Next session starts with**

- The single next action, specific enough to begin without re-reading anything
```

---

### 2026-01-XX — Session 00 (specification)

**Phase:** Pre-development
**Duration:** —
**Tasks completed:** None — specification only

**What shipped**

- `PRD.md` — vision, 4 personas, 40 features, 10 user stories with acceptance criteria
- `ARCHITECTURE.md` — full Postgres schema, RLS policies, RPC functions, cycle engine, API flows
- `RULES.md` — 40 business rules with enforcement class and error codes, anti-cheat model, verification checklist
- `DESIGN.md` — glassmorphism system, complete token set, component specs, motion specs, accessibility requirements
- `TASKS.md` — 178 tasks across 9 phases
- `MEMORY.md` — this file

**Decisions made**

- ADR-001 through ADR-012 recorded above. The load-bearing ones are ADR-002 (self-vote as a CHECK constraint) and ADR-004 (no quota refund on retraction).

**Blockers hit**

- None

**Open questions carried forward**

- Reward composition: recognition, credits, or cash? Needed by Phase 5.
- Is 50 the right threshold for a launch-scale community? Tunable per cycle, so this is a launch-day observation rather than a blocker.
- Domain name not chosen.

**Next session starts with**

- T-0.1 — create the repository and scaffold the Next.js app

---

## 6. Quick reference

### Commands

```bash
npm run dev                 # Next.js dev server
supabase start              # Local Postgres + Auth + Studio
supabase stop
supabase db reset           # Rebuild from migrations + seed — destroys local data
supabase migration new <n>  # New migration file
supabase db push            # Apply migrations to the linked remote project
supabase gen types typescript --local > lib/database.types.ts
npm run test                # Vitest unit tests
npm run test:e2e            # Playwright
npm run typecheck
```

### Local URLs

| Service              | URL                    |
| -------------------- | ---------------------- |
| App                  | http://localhost:3000  |
| Supabase Studio      | http://127.0.0.1:54323 |
| Inbucket (dev email) | http://127.0.0.1:54324 |
| API                  | http://127.0.0.1:54321 |

### Document map

| Question                                         | File                    |
| ------------------------------------------------ | ----------------------- |
| What are we building and for whom?               | `PRD.md`                |
| How is it built? What's the schema?              | `ARCHITECTURE.md`       |
| What are the rules and how are they enforced?    | `RULES.md`              |
| What should it look like and how should it move? | `DESIGN.md`             |
| What's next to build?                            | `TASKS.md`              |
| Where are we and what did we decide?             | `MEMORY.md` (this file) |

---

## 7. Maintenance

**At the end of every session:**

1. Update §1 — phase, progress counts, next action
2. Add a §5 changelog entry
3. Add any new issue to §4
4. Add an ADR to §3 for any structural decision
5. Update the "Last updated" date at the top

**At the end of every phase:**

1. Confirm the exit gate in `TASKS.md` actually passed — don't advance on a partial pass
2. Mark the phase 🟢 in §1.1
3. Note anything learned in the phase that should change later phases
