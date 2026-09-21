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

| Field                | Value                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Current phase**    | Phase 7 — Polish, accessibility & performance (In progress)                                                |
| **Phase progress**   | 6 / 31 tasks (Batch 1: Design completion complete)                                                         |
| **Overall progress** | 143 / 178 tasks                                                                                            |
| **Status**           | Phase 7 Batch 1 (T-7.1–T-7.6) PASSED! 114 Vitest unit tests passing (100% green across 21 test suites).    |
| **Blocked on**       | None. Ready for Batch 2 approval.                                                                          |
| **Next action**      | Phase 7 Batch 2 (T-7.7–T-7.10: Empty states, error states & rule anchors, loading skeleton, 404/500 pages) |
| **Target launch**    | TBD                                                                                                        |
| **Active branch**    | `main`                                                                                                     |
| **Last deploy**      | —                                                                                                          |

### 1.1 Phase board

| Phase | Name                | Status         | Tasks | Exit gate met |
| ----- | ------------------- | -------------- | ----- | ------------- |
| 0     | Foundation          | 🟢 Complete    | 17/17 | ✅            |
| 1     | Database & security | 🟢 Complete    | 34/34 | ✅            |
| 2     | Authentication      | 🟢 Complete    | 16/16 | ✅            |
| 3     | Core loop           | 🟢 Complete    | 25/25 | ✅            |
| 4     | Discovery           | 🟢 Complete    | 18/18 | ✅            |
| 5     | Cycles & rewards    | 🟢 Complete    | 13/13 | ✅            |
| 6     | Trust & admin       | 🟢 Complete    | 14/14 | ✅            |
| 7     | Polish              | 🟡 In progress | 6/31  | ❌            |
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

### ADR-013 — PostgREST generic schema alignment & TypedSupabaseClient

- **Status:** Accepted · 2026-09
- **Context:** In `@supabase/supabase-js` (v2.49+), `SupabaseClient` takes 4 generic arguments (`<Database, SchemaNameOrClientOptions, SchemaName, Schema>`). However, `@supabase/ssr` (v0.5.2) returns `SupabaseClient<Database, SchemaName, Schema>`. Passing 3 parameters shifts the 3rd parameter to `SchemaName`, resulting in PostgREST evaluating `Schema` as `Database[Database['public']]` (which is `never`), collapsing `.from(...)` table and row types to `never`.
- **Decision:** Define and export `TypedSupabaseClient = SupabaseClient<Database, 'public', 'public', Database['public']>` in `lib/supabase/client.ts` and `lib/supabase/server.ts`, and cast the client factory return values. In `lib/database.types.ts`, ensure zero-argument RPC functions declare `Args: Record<string, never>` (instead of `Record<PropertyKey, never>`) to satisfy PostgREST's `GenericFunction` index signature.
- **Consequences:** Full, end-to-end, compile-time type safety across all PostgREST queries, inserts, updates, and RPC calls throughout Server Actions, Route Handlers, and Client Components without any `any` or `never` fallbacks.

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

### 2026-09-21 — Session 13 (Phase 7 Batch 1: Design Completion)

**Phase:** Phase 7 — Polish, accessibility & performance
**Duration:** ~45m
**Tasks completed:** T-7.1, T-7.2, T-7.3, T-7.4, T-7.5, T-7.6

**What shipped**

- `app/globals.css`: Defined `.glass-panel` recipe ensuring all glass surfaces automatically inherit `box-shadow: inset 0 1px 0 var(--edge-specular)` and paint containment `contain: paint` [T-7.4, T-7.3].
- `app/components/votes/vote-button.tsx`: Eliminated nested `backdrop-blur` from `<VoteButton />` when nested inside `<IdeaCard />`, set live vote count to `font-display` with `font-variant-numeric: tabular-nums`, and verified accent grammar (indigo = act, violet = voted) [T-7.2, T-7.6].
- `app/components/ideas/idea-card.tsx`: Enforced radius hierarchy (`--radius-xs`: 6px for category chips, tags, and qualified badges; `--radius-lg`: 20px for card container) and paint containment [T-7.5, T-7.3].
- Modals (`app/components/reports/report-modal.tsx`, `app/components/cycles/winner-modal.tsx`, `app/components/ideas/withdraw-modal.tsx`, `app/admin/cycles/finalize-button.tsx`, `app/components/auth/auth-modal.tsx`): Eliminated secondary `backdrop-blur` from modal surfaces on top of blurred scrims, ensuring strict 0 nested `backdrop-filter` invariant [T-7.2].
- Header (`app/components/votes/quota-hud.tsx`, `app/components/layout/cycle-countdown.tsx`): Eliminated nested `backdrop-blur` from children inside the blurred sticky header [T-7.2].
- Feed & Viewport budget: Verified blurred elements count in the viewport is strictly $\le 12$ across desktop (max 10), tablet (max 7), and mobile (max 4) [T-7.3].
- `tests/design-tokens.test.ts`: Added automated test suite with 11 tests verifying specular edge highlights, radius tiers, accent semantics, nested blur elimination, and viewport budget limits (114/114 Vitest tests passing).

**Decisions made**

- Removed redundant nested `backdrop-blur` from `<VoteButton />`, `<QuotaHUD />`, `<CycleCountdown />`, and modal dialog panels, relying on elevated solid/tint surfaces over the single parent blurred container. This completely eliminates nested compositing passes and prevents frame drops during scrolling.
- Replaced arbitrary pill radii on tags and category chips with strict `--radius-xs` (6px) per `DESIGN.md` §5.1.

**Next session starts with**

- Phase 7 Batch 2 (T-7.7 to T-7.10): Empty states (`DESIGN.md` §7.11), specific error states linked to rule anchors, skeleton loaders preserving layout dimensions, and branded 404/500 error pages.

---

### 2026-09-21 — Session 03

**Phase:** Phase 2 — Authentication (COMPLETED)
**Duration:** ~1h
**Tasks completed:** T-2.13, T-2.14, T-2.15, T-2.16 (Phase 2 Exit Gate PASSED)
**Tasks started:** None

**What shipped**

- Connected live hosted Supabase Cloud project (`tsdghmnmsyogjulpzgmu`) via `.env.local` and verified API connectivity.
- Configured Supabase MCP server in `mcp_config.json` with project reference and features.
- Installed official Supabase Agent Skills (`supabase`, `supabase-postgres-best-practices`) into `.agents/skills/`.
- Successfully pushed and verified all 18 PostgreSQL database migrations directly to live Supabase Cloud database via MCP: `profiles` (8 seed rows), `cycles` (active cycle 1), `ideas` (15 seed rows), `votes` (60 seed rows), `rewards`, `abuse_events`, `reports`, `admin_actions`, views, functions, triggers, and RLS policies all enabled.
- `signOutAction()` in `app/actions/auth.ts`: cookie invalidation and redirect [T-2.13].
- `lib/auth/user.ts` and `lib/auth/use-user.tsx`: server helper `getCurrentUser()` and reactive client hook `useUser()` [T-2.14].
- `app/components/auth/unconfirmed-banner.tsx`: warning banner with resend confirmation link [T-2.15].
- `app/suspended/page.tsx`: suspended account screen rendering moderation reason, restoration time, and read-only allowance [T-2.15].
- `playwright.config.ts` and `e2e/auth.spec.ts`: complete Playwright E2E suite verifying route guards, 404 admin rewrites, password strength checklist, secure login error messages, and anti-enumeration forgot-password flow (all 6 tests passing) [T-2.16].
- All 13 unit tests passing in Vitest; Next.js dev server running with zero errors.

**Decisions made**

- Wrapped root layout with `UserProvider` initialized with server-fetched user session and profile row to avoid hydration flicker.

### 2026-09-21 — Session 08 (Phase 3 Batch 5: IdeaCard, QualificationBar, Auth Replay & Phase 3 Exit Gate)

**Phase:** Phase 3 — Core loop: submit & vote
**Duration:** ~1h
**Tasks completed:** T-3.19, T-3.21, T-3.22, T-3.23, T-3.24, T-3.25
**Phase 3 Exit Gate:** ✅ All acceptance criteria for US-03, US-04, US-05 pass. All abuse probes (self-vote, double-vote, 6th vote quota exceeded, submission cooldown) verified and rejected with exact, non-generic messages.

**What shipped**

- `app/components/auth/auth-modal.tsx`: L4 glass authentication modal triggered on anonymous vote click, capturing and immediately replaying the intended vote upon sign-in [T-3.19, AC-06.2].
- `app/components/ideas/idea-card.tsx`: L2 glass `<IdeaCard />` per `DESIGN.md` §7.3 with qualified variant, permanent/hover gradient rings, 2-line title clamp, 3-line summary clamp, and nested interactive `<VoteButton />` [T-3.21].
- `app/components/ideas/qualification-bar.tsx`: `<QualificationBar />` with proper ARIA semantics (`role="progressbar"`, `aria-label="Verified votes toward qualification"`, min/max/valuenow) and gradient color flips at 100% threshold [T-3.23].
- `app/idea/[slug]/page.tsx`: Integrated `<QualificationBar />` and verified vs raw vote divergence display when gap exceeds 10% per `RULES.md` BR-033 [T-3.22, T-3.24].
- `app/components/votes/vote-button.tsx`: Integrated `<AuthModal />` for anonymous voters and verified locked author view with tooltip `"You can't vote on your own idea."` [T-3.19, T-3.25].
- `tests/idea-display.test.ts`: Vitest suite covering qualification thresholds and BR-033 divergence detection (47 total unit tests passing).
- `e2e/voting.spec.ts`: Playwright suite covering QuotaHUD, self-vote lock, anonymous vote modal popup, qualification ARIA attributes, and 10-minute vote retraction with BR-014 notice (16 total E2E tests passing).

**Decisions made**

- Retained idempotency in E2E tests by clearing test vote rows before test executions while preserving immutable database ledger constraints in production.

**Next session starts with**

- Phase 4 — Discovery & leaderboard (T-4.1 to T-4.4): `/feed` RSC with responsive card grid, cursor pagination on `(created_at, id)`, infinite scroll, and sort controls.

---

### 2026-09-21 — Session 07 (Phase 3 Batch 4: Vote Animations, QuotaHUD & Retraction)

**Phase:** Phase 3 — Core loop: submit & vote
**Duration:** ~1h
**Tasks completed:** T-3.14, T-3.15, T-3.16, T-3.17, T-3.18, T-3.20
**Tasks started:** T-3.19, T-3.21

**What shipped**

- `app/components/votes/motion.ts`: Framer Motion variants implementing signature 640ms vote sequence (`voteRing`, `countRoll`, `iconPop`, `rejectionShake`) with full `prefers-reduced-motion` support [T-3.14, T-3.15, T-3.20].
- `app/actions/votes.ts`: `retractVoteAction(ideaId)` Server Action calling `retract_vote` RPC, validating 10-minute window, and maintaining quota slot consumption per `RULES.md` BR-014 and `ADR-004` [T-3.18].
- `app/actions/votes.ts`: `getVoteQuotaAction()` Server Action retrieving rolling 24-hour quota, remaining count, and `nextSlotAt` timestamp [T-3.17].
- `app/components/votes/quota-hud.tsx`: Header `<QuotaHUD />` pill (L3 glass, 36px, radius-full) with 5 pips, cyan glow on active votes, pip extinguish animation on vote, warning styling at 1 left, and 30-second client re-derivation without clock drift [T-3.16, T-3.17].
- `app/components/votes/vote-button.tsx`: Added retraction countdown affordance `×` during the 10-minute window, toast feedback, and event synchronization with header `<QuotaHUD />` [T-3.14, T-3.18].
- `app/components/ui/header.tsx`: Global 64px header mounted in `app/layout.tsx` featuring IdeaPulse brand, feed navigation, QuotaHUD, and auth controls [T-3.16].
- `tests/votes.test.ts`: Added unit tests for retraction error codes and motion variants (now 13 tests in suite, 45 total across all suites).
- `e2e/voting.spec.ts`: Playwright suite covering QuotaHUD rendering with 5 pips, vote cast with count roll, and 10-minute retraction with BR-014 notice (15 total E2E tests passing).

**Decisions made**

- Header QuotaHUD communicates with page-level VoteButtons via custom `ideapulse:vote-update` window events for instant zero-latency pip extinction and count updates without full page reloads.

**Next session starts with**

- Phase 3 Batch 5 (T-3.19, T-3.21 to T-3.25): Anonymous vote auth modal replay, `<IdeaCard />`, full idea detail view `/idea/[slug]` refinements, `<QualificationBar />`, and vote divergence display.

---

### 2026-09-21 — Session 06 (Phase 3 Batch 3: Voting Core & VoteButton)

**Phase:** Phase 3 — Core loop: submit & vote
**Duration:** ~1h
**Tasks completed:** T-3.9, T-3.10, T-3.11, T-3.12, T-3.13
**Tasks started:** T-3.14

**What shipped**

- `app/actions/votes.ts`: `castVoteAction(ideaId)` Server Action calling PostgreSQL `cast_vote` RPC with advisory lock and server-side verification [T-3.9].
- `lib/votes/errors.ts`: Typed discriminated union error mapper converting PostgreSQL constraints/error codes (`IP_UNAUTHENTICATED`, `IP_ACCOUNT_NOT_WRITABLE`, `IP_SELF_VOTE`, `IP_DUPLICATE_VOTE`, `IP_VOTE_QUOTA`, `IP_IDEA_CLOSED`, `IP_RATE_LIMITED`) into exact user-facing copy per `RULES.md` §7 [T-3.10].
- `app/components/votes/vote-button.tsx`: 44px pill `<VoteButton />` supporting all 8 states (`available`, `voted`, `retractable`, `quota_exhausted`, `own_idea`, `anonymous`, `pending`, `rejected`) per `DESIGN.md` §7.2 [T-3.11].
- `app/components/votes/vote-button.tsx`: Immediate optimistic count increment and visual transition via `useOptimistic`, reconciled against server response [T-3.12].
- `app/components/votes/vote-button.tsx`: Rejection rollback with horizontal shake animation and local inline reason per `DESIGN.md` §6.3 and `RULES.md` §7 [T-3.13].
- `app/idea/[slug]/page.tsx`: Integrated `<VoteButton />` on idea detail page with active vote detection for signed-in user and disabled lock for idea author [T-3.11, T-3.25].
- `tests/votes.test.ts`: Vitest unit test suite with 11 tests verifying all SQL error mappings and quota duration calculations.
- `e2e/voting.spec.ts`: Playwright test suite with 3 tests verifying self-vote lock, anonymous redirect with return path, and eligible optimistic voting flow.

**Decisions made**

- Retained strict zero-generic-error policy for voting failures with local inline alert below the button.

**Next session starts with**

- Phase 3 Batch 4 (T-3.14 to T-3.18): Vote animation sequence (`DESIGN.md` §6.3), `<QuotaHUD />` in header (5 pips, rolling 24h timer, 30s re-derivation), and 10-minute vote retraction affordance.

---

### 2026-09-21 — Session 05 (Phase 3 Batch 2: Draft Autosave, Details & Withdrawal)

**Phase:** Phase 3 — Core loop: submit & vote
**Duration:** ~1h
**Tasks completed:** T-3.6, T-3.7, T-3.8
**Tasks started:** T-3.9

**What shipped**

- `app/components/ideas/idea-form.tsx`: LocalStorage draft autosave (debounced 500ms), draft recovery on mount with saved time banner and "Discard draft" trigger, and draft cleanup on successful submission [T-3.6].
- `app/components/ui/toast.tsx` & `app/layout.tsx`: Design-system compliant L4 glass toast notifications (`DESIGN.md` §7.10) with automatic stacking, dismiss, and queue capping [T-3.7].
- `app/idea/[slug]/page.tsx` & `idea-actions.tsx`: Idea detail view displaying proposal markdown, author information, status badges, qualification progress bar (`DESIGN.md` §7.5), and `?created=1` confirmation toast [T-3.7].
- `app/actions/ideas.ts`: `withdrawIdeaAction()` Server Action verifying author permissions, updating `ideas.status = 'withdrawn'`, and revalidating public views [T-3.8].
- `app/components/ideas/withdraw-modal.tsx`: L4 glass modal (`DESIGN.md` §7.9) featuring verbatim consequence warning per `RULES.md` BR-023 [T-3.8].
- `tests/ideas-lifecycle.test.ts`: Vitest suite with 4 tests covering draft serialization and withdrawal rule assertions.
- `e2e/submit-lifecycle.spec.ts`: Playwright E2E suite verifying draft restoration after page reload, idea detail rendering, and modal cancellation/consequence verification.

**Decisions made**

- `ToastProvider` mounted at root layout so notifications can be triggered from any client page or action seamlessly.
- Idea Detail page handles both single object and array returns from Supabase joined relations gracefully.

**Next session starts with**

- Phase 3 Batch 3 (T-3.9 to T-3.13): Voting server action `castVote()`, `VoteError` mapper, `<VoteButton />` (all 8 states), and optimistic UI with rollback.

---

### 2026-09-21 — Session 10 (Phase 5 Batch 2: Rotation Retry, Cycle Archive, Winner Modal & Rewards)

**Phase:** Phase 5 — Cycles & rewards
**Duration:** ~40m
**Tasks completed:** T-5.7, T-5.8, T-5.9, T-5.10, T-5.11

**What shipped**

- `app/actions/votes.ts` & `app/actions/ideas.ts`: Integrated 3-second automatic retry on `IP_NO_ACTIVE_CYCLE` to handle brief closing states during cycle rotation per `RULES.md` BR-043 [T-5.7].
- `app/cycles/[n]/page.tsx`: Full `/cycles/[n]` archive page displaying cycle dates with timezone/UTC offset, metadata, zero-qualifiers note per `BR-048`, winners podium cards (Rank 1, 2, 3), and complete final standings table [T-5.8].
- `app/actions/rewards.ts`: Created `getWinnerRewardsAction()` fetching recent rewards awarded to the current authenticated user [T-5.9].
- `app/components/cycles/winner-modal.tsx`: Winner celebration modal dialog with violet glow, trophy animation, and `localStorage` persistence (`ideapulse:winner_seen:${reward.id}`) [T-5.9].
- `app/layout.tsx`: Mounted `<WinnerModal />` globally inside root layout [T-5.9].
- `app/components/cycles/cycle-sweep.tsx` & `app/globals.css`: Implemented 900ms one-time celebratory soft violet sweep across qualified rows on finalized boards per `DESIGN.md` §6.4 with `localStorage` (`ideapulse:sweep_celebration:${cycle.id}`) [T-5.10].
- `app/components/profile/profile-rewards.tsx`: Created ProfileRewards component rendering user's earned cycle honors, rank badges, verified vote count, and cycle links with contextual empty states [T-5.11].
- `app/u/[username]/page.tsx`: Embedded ProfileRewards section into public profile page [T-5.11].
- `tests/cycles-archive.test.ts`: Added test suite covering archive filtering, BR-048 public note, localStorage keys, and rotation retry logic (79/79 Vitest tests passing).

**Decisions made**

- Wrapped both vote casting and idea submission with automatic 3s retries on `IP_NO_ACTIVE_CYCLE` to ensure zero user friction during weekly Sunday midnight rotation transactions.
- Mounted the winner modal in RootLayout so winning creators receive celebration upon logging in regardless of landing page.

**Next session starts with**

- Phase 5 Batch 3 (T-5.12, T-5.13 + Phase 5 Exit Gate): Heartbeat tracking, multi-cycle rotation simulation on staging.

### 2026-09-21 — Session 09 (Phase 5 Batch 1: Cycle Engine & Automated Rotation)

**Phase:** Phase 5 — Cycles & rewards
**Duration:** ~35m
**Tasks completed:** T-5.1, T-5.2, T-5.3, T-5.4, T-5.5, T-5.6

**What shipped**

- `cron.job`: Confirmed `ideapulse-rotate-cycle` scheduled via `pg_cron` at `0 0 * * 1` executing `select public.rotate_cycle();` every Monday at 00:00 UTC [T-5.1].
- `lib/supabase/admin.ts`: Created server-only administrative Supabase client using `SUPABASE_SERVICE_ROLE_KEY` [T-5.2].
- `app/api/cron/rotate-cycle/route.ts`: Built Vercel Cron fallback route supporting GET/POST, protected by shared `CRON_SECRET` authorization, invoking `rotate_cycle()` [T-5.2].
- `vercel.json`: Added Vercel Cron configuration calling `/api/cron/rotate-cycle` at `0 0 * * 1` [T-5.2].
- `tests/cycle-engine.test.ts`: Comprehensive test suite in Vitest and PostgreSQL covering [T-5.3, T-5.4, T-5.5, T-5.6]:
  - Finalization with 0, 1, 3, and 8 qualifying ideas, proving rewards are capped strictly at `reward_slots` (3) [T-5.3].
  - Deterministic tie-breaking on identical vote counts broken by `qualified_at asc` (earlier momentum wins per `BR-046`) [T-5.4].
  - Clean zero-qualifier finalization with 0 rewards created and public note _"No idea reached the 50-vote threshold this cycle."_ per `BR-048` [T-5.5].
  - Verification that attempting to insert a second active cycle fails on partial unique index `cycles_single_active_idx` [T-5.6].

**Decisions made**

- Tested both PostgreSQL stored procedure constraints directly against the live database and established automated regression tests in Vitest (74/74 tests green).
- Configured cron endpoint with dual header support (`Authorization: Bearer <CRON_SECRET>` and `x-cron-secret`) for seamless compatibility with Vercel Cron and manual triggers.

**Next session starts with**

- Phase 5 Batch 2 (T-5.7 to T-5.11): Rotation retry, `/cycles/[n]` archive, winner modal, profile rewards section.

### 2026-09-21 — Session 08 (Phase 4 Batch 4: Profile, Landing Page, Rules & Search — Phase 4 Complete!)

**Phase:** Phase 4 — Discovery & leaderboard
**Duration:** ~45m
**Tasks completed:** T-4.15, T-4.16, T-4.17, T-4.18 (Phase 4 100% complete!)

**What shipped**

- `supabase/migrations/138_feed_search.sql`: Extended `get_feed_ideas` RPC to accept `p_search text default null` matching `title` and `summary` with `ilike` [T-4.18].
- `lib/feed.ts` & `app/actions/feed.ts`: Added `search?: string | null` to params and RPC invocation payload [T-4.18].
- `app/components/feed/search-bar.tsx`: Search input with clear affordance (`×`) and live URL syncing [T-4.18].
- `app/components/feed/feed-grid.tsx`: Integrated search query propagation into client feed grid and infinite scroll [T-4.18].
- `app/feed/page.tsx`: Integrated search bar into the feed header alongside sort tabs and filter chips [T-4.18].
- `app/components/profile/profile-header.tsx`: Profile visual header with avatar, bio, username, member since date, and stats counters (authored ideas, votes received, cycles won) [T-4.15].
- `app/u/[username]/page.tsx`: Public profile RSC fetching user identity, published proposals, owner vs visitor contextual empty states per `DESIGN.md` §7.11, and strict privacy invariant (never exposes what proposals the user voted on per ADR-006 / BR-003) [T-4.15].
- `app/components/landing/hero-showcase.tsx` & `app/page.tsx`: Premium dark glass landing page featuring staggered Framer Motion entrance, live active cycle top 3 showcase, 3-line rules summary, and primary CTA [T-4.16].
- `app/components/rules/rules-search.tsx` & `app/rules/page.tsx`: Protocol rules specification page generated directly from `RULES.md` with semantic anchor IDs (`id="BR-001"` through `id="BR-040"`), enforcement badges, and error code reference table for deep-linking [T-4.17].
- `tests/profile.test.ts` & `tests/search.test.ts`: Added test suites covering profile aggregation, vote ledger query prohibition, and search parameter normalization (67/67 Vitest tests passing).

**Decisions made**

- Retained database-level `ilike` search in `get_feed_ideas` migration for fast keyword searching on both title and summary without external dependencies.
- Structured public profile page to strictly never query `votes` by user id, reinforcing ADR-006 and BR-003 invariants.

**Next session starts with**

- Obtain Phase 4 Exit Gate Approval from user, then begin Phase 5 (Cycles & Rewards: T-5.1 through T-5.6).

### 2026-09-21 — Session 07 (Phase 4 Batch 3: Realtime Motion & Cycle Countdown)

**Phase:** Phase 4 — Discovery & leaderboard
**Duration:** ~45m
**Tasks completed:** T-4.11, T-4.12, T-4.13, T-4.14

**What shipped**

- `app/components/leaderboard/realtime-leaderboard.tsx`: Realtime subscription to `ideas` filtered by `cycle_id` [T-4.11], client-side live rank re-computation, and 600 ms cyan left border flash on ascending rows [T-4.12].
- `lib/motion.ts`: Framer Motion spring presets (`spring.rank` stiffness 420, damping 32) per `DESIGN.md` §6.2.
- `app/components/leaderboard/leaderboard-row.tsx`: `<motion.li layout transition={spring.rank}>` with `useReducedMotion()` compliance [T-4.12].
- `tests/security-realtime.test.ts`: Automated privacy invariant test confirming `votes` is strictly excluded from `supabase_realtime` publication (`ADR-006`, `BR-003`) [T-4.13].
- `app/components/layout/cycle-countdown.tsx`: Persistent header cycle countdown with local timezone and UTC offset [T-4.14].
- `tests/realtime-leaderboard.test.ts`: Vitest suite covering rank recomputation, ascending rank detection, and UTC offset format.

**Decisions made**

- Per user instruction, deferred ongoing Playwright E2E suites until full platform completion; relied on strict TypeScript check and Vitest unit suites for rapid, reliable execution.

**Next session starts with**

- Phase 4 Batch 4 (T-4.15 to T-4.18): Profile page `/u/[username]`, landing page hero & live top 3, `/rules` page generated from `RULES.md`, and Phase 4 Exit Gate.

---

### 2026-09-21 — Session 06 (Phase 4 Batch 2: Filters, Skeletons & Leaderboard)

**Phase:** Phase 4 — Discovery & leaderboard
**Duration:** ~1h
**Tasks completed:** T-4.6, T-4.7, T-4.8, T-4.9, T-4.10

**What shipped**

- `supabase/migrations/136_feed_multi_filters.sql`: Enhanced `get_feed_ideas` RPC to support multi-select category and tag filtering with string array conversion and array overlap (`&&`). Applied and verified on live Supabase cloud via MCP [T-4.6].
- `app/components/feed/filter-chips.tsx`: Multi-select category pills and tag filter chips synchronized with URL search params (`?category=...&tag=...`) with quick clear actions [T-4.6].
- `app/components/feed/feed-empty-state.tsx`: Dedicated L2 glass empty states for filtered zero-results and empty active cycle proposals with tailored reset and submit CTAs [T-4.7].
- `app/components/ideas/idea-card-skeleton.tsx`: Exact-dimension `<IdeaCardSkeleton />` and `<IdeaCardSkeletonGrid />` featuring `1.6s linear infinite` shimmer sweep per `DESIGN.md` §6.4 & §7.3 to eliminate layout shift [T-4.8].
- `supabase/migrations/137_leaderboard_function.sql`: Implemented `get_leaderboard` SQL RPC querying `idea_public_stats` joined to `ideas` and `profiles` for the active cycle [T-4.9]. Applied to live Supabase cloud.
- `lib/leaderboard.ts` & `app/actions/leaderboard.ts`: TypeScript leaderboard interfaces, `formatRank` two-digit numeral helper, and `getLeaderboardAction()` server action [T-4.9].
- `app/components/leaderboard/leaderboard-row.tsx`: `<LeaderboardRow />` component in semantic `<ol>` with rank 1 violet glow, rank 1-3 numerals in `--violet-bright`, rest in `--text-tertiary`, status badge, and cyan verified votes pill [T-4.10].
- `app/leaderboard/page.tsx`: `/leaderboard` RSC rendering top 20 ranked proposals with cycle context and rules badge [T-4.9].
- `tests/leaderboard.test.ts` & `tests/filters.test.ts`: Vitest test suites with 7 tests covering rank formatting, tie-breaking logic, and filter parameter parsing.
- `e2e/feed-filters.spec.ts` & `e2e/leaderboard.spec.ts`: Playwright test suites with 5 tests verifying category and tag filtering, empty state reset, and leaderboard ranking.

**Decisions made**

- Created dedicated `get_leaderboard` SQL RPC to bypass PostgREST view-join limitations while ensuring atomic, indexed rank retrieval with zero client joins.
- Enhanced optimistic retraction window calculation in `vote-button.tsx` to immediately render the `×` affordance for optimistic votes without awaiting network roundtrips.

**Next session starts with**

- Phase 4 Batch 3 (T-4.11 to T-4.14): Realtime subscription on `ideas`, Framer Motion `layout` rank reorder with spring `rank` + cyan flash, verify realtime not on `votes`, and cycle countdown in header.

---

### 2026-09-21 — Session 05 (Phase 4 Batch 1: Feed Discovery Core)

**Phase:** Phase 4 — Discovery & leaderboard
**Duration:** ~1h
**Tasks completed:** T-4.1, T-4.2, T-4.3, T-4.4, T-4.5

**What shipped**

- `supabase/migrations/135_feed_functions.sql`: Implemented `get_feed_ideas(...)` SQL RPC with SQL-computed trending score `verified_votes / power((extract(epoch from (now() - created_at)) / 3600.0) + 2.0, 1.5)` [T-4.5] and cursor pagination on `(created_at, id)` / `(score, id)` / `(verified_votes, id)` [T-4.2]. Applied and verified on live Supabase cloud via MCP.
- `lib/feed.ts`: Isolated feed types, composite cursor encoding/decoding (`encodeFeedCursor`, `decodeFeedCursor`) [T-4.2].
- `app/actions/feed.ts`: `getFeedIdeasAction()` Server Action fetching ideas via RPC and resolving viewer votes in a single batch [T-4.1].
- `app/components/feed/sort-tabs.tsx`: Glass pill sort tabs (Trending, Newest, Top this Cycle) with active state persisted in URL (`?sort=...`) [T-4.4].
- `app/components/feed/feed-grid.tsx`: Responsive grid (1 / 2 / 3 cols per `DESIGN.md` §5.3) with `IntersectionObserver` infinite scroll and keyboard accessible fallback button [T-4.1, T-4.3].
- `app/feed/page.tsx`: `/feed` RSC prefetching first page and mounting discovery components [T-4.1].
- `tests/feed.test.ts`: Vitest suite with 5 tests verifying cursor encoding/decoding and trending score decay mathematical behavior [T-4.2, T-4.5].
- `e2e/feed.spec.ts`: Playwright suite with 3 tests verifying header, active cycle badge, sort tabs URL persistence, and responsive card rendering.

**Decisions made**

- Extracted non-async cursor encoding utilities into `lib/feed.ts` so `app/actions/feed.ts` only exports async functions per Next.js 14 Server Action constraints.
- Cast `p.username::text` in Postgres table-valued function to prevent `citext` return type mismatches.

**Next session starts with**

- Phase 4 Batch 2 (T-4.6 to T-4.10): Category & tag filter chips, empty states, card skeleton loaders, and `/leaderboard` RSC top 20 ranked list with `<LeaderboardRow />`.

---

### 2026-09-21 — Session 04 (Phase 3 Batch 1: Idea Submission)

**Phase:** Phase 3 — Core loop: submit & vote
**Duration:** ~1.5h
**Tasks completed:** T-3.1, T-3.2, T-3.3, T-3.4, T-3.5
**Tasks started:** T-3.6

**What shipped**

- `app/submit/page.tsx`: RSC with server-side cooldown check and branching between `<IdeaForm />` and `<CooldownPanel />` [T-3.1].
- `app/components/ideas/char-counter.tsx` & `idea-form.tsx`: Full submission form with title (10-120), summary (40-280), body (100-5000), categories, tags, and dynamic character counters turning warning at 95% and danger at 100% per `DESIGN.md` §7.7 [T-3.2].
- `app/actions/ideas.ts`: `submitIdeaAction()` Server Action mapping `IP_SUBMIT_COOLDOWN` and `IP_ACCOUNT_NOT_WRITABLE` exceptions cleanly [T-3.3].
- `app/components/ideas/cooldown-panel.tsx`: Live second-by-second countdown with exact UTC and local timezone offsets per `RULES.md` BR-020 [T-3.4].
- `lib/markdown.tsx` & `app/components/ideas/markdown-preview.tsx`: Sanitized markdown parser for restricted subset (bold, italic, links, lists, code) with zero `dangerouslySetInnerHTML` for complete XSS immunity [T-3.5].
- `tests/ideas.test.ts`: Vitest suite with 15 tests covering character boundaries, markdown sanitization, and BR-020 message formatting.
- `e2e/submit.spec.ts`: Playwright test suite covering unauthenticated redirect, cooldown panel with live timers, and eligible idea form interactions.

**Decisions made**

- `formatNextSlotMessage()` moved to `lib/ideas.ts` to keep `app/actions/ideas.ts` purely async for Next.js 14 Server Action compilation.
- Synced `auth.users` GoTrue token non-null string expectations for live Supabase Cloud authentication.

**Blockers hit**

- Next.js Server Action compiler requires all exports in `'use server'` files to be async functions. Resolved by extracting formatting utilities into `lib/ideas.ts`.

**Next session starts with**

- Phase 3 Batch 2 (T-3.6 to T-3.8): LocalStorage draft autosave, submission redirect & toast, and idea withdrawal flow.

---

### 2026-09-21 — Session 03 (Phase 2 Auth Completion)

**Phase:** Phase 2 — Authentication
**Duration:** ~2h
**Tasks completed:** T-2.7 through T-2.16

**What shipped**

- `app/auth/callback/route.ts`: PKCE / OTP code exchange route handler [T-2.7].
- `app/auth/confirm/page.tsx`: celebratory email confirmation landing screen [T-2.8].
- `app/forgot-password/` & `app/reset-password/`: password recovery request and secure update flows [T-2.9].
- `app/components/auth/oauth-buttons.tsx`: GitHub & Google OAuth sign-in with brand icons [T-2.10].
- `app/settings/page.tsx` & `app/actions/profile.ts`: profile editing with 30-day username cooldown enforcement [T-2.11].
- `app/api/username/check/route.ts`: debounced username availability endpoint backed by `citext` index [T-2.12].
- `app/actions/auth.ts`: `signOutAction()` [T-2.13] and `resendConfirmationAction()` [T-2.15].
- `lib/auth/user.ts` & `lib/auth/use-user.tsx`: `getCurrentUser()` server helper and `UserProvider` / `useUser()` hook [T-2.14].
- `app/components/auth/unconfirmed-banner.tsx`: warning banner with resend trigger [T-2.15].
- `app/suspended/page.tsx`: suspended account screen [T-2.15].
- `e2e/auth.spec.ts`: Playwright suite for Phase 2 auth loop [T-2.16].

**Decisions made**

- ADR-013: Export `TypedSupabaseClient` to circumvent `@supabase/ssr` 3-parameter generic shift against `@supabase/supabase-js` 4-parameter `SupabaseClient`.

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
