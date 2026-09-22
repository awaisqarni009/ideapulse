# TASKS.md — IdeaPulse

**Implementation Checklist**
Version 1.0 · 9 phases · Estimated 7–8 weeks for one full-stack developer

---

## How to use this file

- Work phases in order. Each phase has an **exit gate** that must pass before the next phase starts.
- Check items off in place and commit the change with the work. This file is the single source of build truth alongside `MEMORY.md`.
- `[!]` marks a blocking task — nothing downstream in the phase can proceed without it.
- Task IDs are stable. Reference them in commit messages: `feat(votes): cast_vote RPC [T-3.2]`.

**Progress:** Phase 0 ▣ · 1 ▢ · 2 ▢ · 3 ▢ · 4 ▢ · 5 ▢ · 6 ▢ · 7 ▢ · 8 ▢

---

## Phase 0 — Project foundation

_Goal: a running skeleton with CI, types, and tokens in place. Estimated 3 days._

### Repository & tooling

- [x] **T-0.1** `[!]` Create the repo, `main` branch protected, PRs required
- [x] **T-0.2** `npx create-next-app@latest ideapulse --typescript --tailwind --app --eslint`
- [x] **T-0.3** Configure `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`, `@/*` path alias
- [x] **T-0.4** Add Prettier + `prettier-plugin-tailwindcss`, and an `.editorconfig`
- [x] **T-0.5** Install Husky + lint-staged: typecheck, lint, and format on pre-commit
- [x] **T-0.6** Install core deps: `@supabase/supabase-js`, `@supabase/ssr`, `framer-motion`, `zod`, `date-fns`, `lucide-react`
- [x] **T-0.7** Install dev deps: `vitest`, `@testing-library/react`, `@playwright/test`, `supabase` CLI
- [x] **T-0.8** GitHub Actions: typecheck → lint → unit tests → build on every PR

### Design foundation

- [x] **T-0.9** `[!]` Write `app/globals.css` with the complete token block from `DESIGN.md` §9
- [x] **T-0.10** Extend `tailwind.config.ts` per `DESIGN.md` §9.1
- [x] **T-0.11** Load Space Grotesk via `next/font/google`, Geist Sans via the `geist` package, expose both as CSS variables on `<html>`
- [x] **T-0.12** Build the ambient glow layer on `<body>::before` (`DESIGN.md` §2.7)
- [x] **T-0.13** Add the global `prefers-reduced-motion` reset
- [x] **T-0.14** Create `/dev/tokens` — a page rendering every color, type step, radius, shadow, and glow for visual verification

### Shared constants

- [x] **T-0.15** `[!]` `lib/constants.ts` — one source of truth for `VOTE_LIMIT_PER_DAY`, `SUBMISSION_COOLDOWN_DAYS`, `QUALIFY_THRESHOLD`, `RETRACTION_WINDOW_MIN`, field length bounds, category list
- [x] **T-0.16** `lib/errors.ts` — the `IP_*` error code union and one user-facing message per code (`RULES.md` §7)
- [x] **T-0.17** `lib/validation.ts` — zod schemas built from `constants.ts` so client validation cannot drift from the database `CHECK` constraints

**Exit gate:** `npm run build` succeeds, CI is green, `/dev/tokens` renders every token correctly in the browser. [PASSED]

---

## Phase 1 — Database & security

_Goal: the full schema with RLS, proven correct by tests, before a single UI screen exists. Estimated 5 days._

### Supabase setup

- [x] **T-1.1** `[!]` Create the Supabase project (free tier), region closest to the primary audience
- [x] **T-1.2** `supabase init` and `supabase link --project-ref <ref>`
- [x] **T-1.3** Get local dev running: `supabase start`
- [x] **T-1.4** Record all keys in `.env.local`; confirm `.env*` is gitignored

### Migrations

Write each as a numbered file in `supabase/migrations/`. Apply locally, test, then push.

- [x] **T-1.5** `[!]` `000_extensions.sql` — pgcrypto, citext, pg_cron
- [x] **T-1.6** `[!]` `001_enums.sql` — all 6 enum types
- [x] **T-1.7** `[!]` `010_profiles.sql` — table, constraints, indexes
- [x] **T-1.8** `[!]` `011_handle_new_user.sql` — profile-creation trigger with username deduplication
- [x] **T-1.9** `[!]` `020_cycles.sql` — table, single-active partial unique index, `active_cycle_id()`
- [x] **T-1.10** `[!]` `030_ideas.sql` — table, all CHECK constraints, **including `ideas_id_author_uk`**
- [x] **T-1.11** `[!]` `040_votes.sql` — table, composite FK, `votes_no_self_vote` CHECK, unique constraints, quota index
- [x] **T-1.12** `050_rewards.sql`
- [x] **T-1.13** `060_safety.sql` — `abuse_events`, `reports`, `admin_actions`
- [x] **T-1.14** `070_helpers.sql` — `is_admin`, `account_is_writable`, `voter_is_verified`, `log_abuse`
- [x] **T-1.15** `[!]` `080_cast_vote.sql` — the vote RPC with the advisory lock
- [x] **T-1.16** `085_retract_vote.sql`
- [x] **T-1.17** `[!]` `090_counters.sql` — `sync_vote_counters` trigger including `qualified_at`
- [x] **T-1.18** `[!]` `100_submission_quota.sql` — cooldown trigger, slug generation, immutability guard
- [x] **T-1.19** `110_cycle_engine.sql` — `open_next_cycle`, `finalize_cycle`, `rotate_cycle`
- [x] **T-1.20** `[!]` `120_rls.sql` — enable RLS on all tables, all policies, all column grants and revokes
- [x] **T-1.21** `130_views.sql` — `idea_public_stats`
- [x] **T-1.22** `140_seed.sql` — cycle 1, 8 test users, 15 ideas, ~60 votes (local only)

### Security verification

- [x] **T-1.23** `[!]` Write `supabase/tests/rls.test.sql` using pgTAP
- [x] **T-1.24** Test: anonymous client cannot insert into any table
- [x] **T-1.25** Test: user A cannot read user B's vote rows
- [x] **T-1.26** Test: user cannot update their own `role` column
- [x] **T-1.27** `[!]` Test: self-vote rejected through `cast_vote`
- [x] **T-1.28** `[!]` Test: self-vote rejected through a direct PostgREST insert
- [x] **T-1.29** `[!]` Test: self-vote rejected with all triggers disabled — proves the CHECK constraint is load-bearing
- [x] **T-1.30** `[!]` Test: 20 concurrent votes from one account produce exactly 5 rows (`RULES.md` BR-031)
- [x] **T-1.31** Test: second submission within 7 days rejected with the correct next-slot timestamp
- [x] **T-1.32** Test: vote from a 23-hour-old account is recorded with `is_verified = false`
- [x] **T-1.33** Test: `qualified_at` is set exactly once, on the threshold-crossing vote
- [x] **T-1.34** Generate types: `supabase gen types typescript --local > lib/database.types.ts`; add to CI so drift fails the build

**Exit gate:** every pgTAP test passes; `supabase db reset` rebuilds the schema from zero without error; generated types compile. [PASSED]

---

## Phase 2 — Authentication

_Goal: a user can register, confirm, sign in, and edit their profile. Estimated 4 days._

- [x] **T-2.1** `[!]` `lib/supabase/client.ts`, `server.ts`, `middleware.ts` — the three `@supabase/ssr` client factories
- [x] **T-2.2** `[!]` `middleware.ts` — session refresh on every request, route guards for `/submit` and `/settings`, 404 rewrite for `/admin/*`
- [x] **T-2.3** Configure Supabase Auth: confirm-email required, redirect URLs, session length
- [x] **T-2.4** Customize the confirmation and password-reset email templates to match the brand voice
- [x] **T-2.5** `/register` — form, zod validation, generic success response (no account enumeration, `AC-01.3`)
- [x] **T-2.6** `/login` — form, `?next=` redirect handling, specific-but-safe error messages
- [x] **T-2.7** `/auth/callback` — code exchange route handler
- [x] **T-2.8** `/auth/confirm` — post-confirmation landing with a clear next action
- [x] **T-2.9** Password reset request + update flows
- [x] **T-2.10** OAuth providers (GitHub, Google) wired and tested
- [x] **T-2.11** `/settings` — display name, username (30-day change limit), bio, avatar URL
- [x] **T-2.12** Username availability check, debounced, with the `citext` uniqueness constraint as the real gate
- [x] **T-2.13** Sign-out action clearing cookies and revalidating
- [x] **T-2.14** `useUser()` hook / server helper returning the session plus the profile row
- [x] **T-2.15** Auth empty and error states: unconfirmed banner with a resend link, suspended account screen
- [x] **T-2.16** E2E: register → confirm → sign in → edit profile → sign out

**Exit gate:** a new user can complete the full loop in under 60 seconds; a profile row exists for every `auth.users` row; `AC-01.*` and `AC-02.*` pass. [PASSED]

---

## Phase 3 — Core loop: submit & vote

_Goal: the product's reason to exist. Estimated 8 days._

### Submission

- [x] **T-3.1** `[!]` `/submit` RSC — reads cooldown state server-side, branches to form or `<CooldownPanel />`
- [x] **T-3.2** `<IdeaForm />` — title, summary, body, category, tags; zod-validated; character counters per `DESIGN.md` §7.7
- [x] **T-3.3** `submitIdea()` server action, mapping `IP_SUBMIT_COOLDOWN` to a precise next-slot message
- [x] **T-3.4** `<CooldownPanel />` — live countdown to the exact reopen time, in local time with the UTC offset shown
- [x] **T-3.5** Live markdown preview (sanitized, restricted subset: bold, italic, links, lists, code)
- [x] **T-3.6** Draft autosave to `localStorage`, restored on return, cleared on successful submit
- [x] **T-3.7** Success path: redirect to `/idea/[slug]` with a confirmation toast
- [x] **T-3.8** Withdraw flow with the full-consequence confirmation copy (`RULES.md` BR-023)

### Voting

- [x] **T-3.9** `[!]` `castVote()` server action calling the `cast_vote` RPC
- [x] **T-3.10** `[!]` Error mapper: SQLSTATE + message → typed `VoteError` union
- [x] **T-3.11** `[!]` `<VoteButton />` with all 8 states from `DESIGN.md` §7.2
- [x] **T-3.12** `[!]` Optimistic update via `useOptimistic`, reconciled against the server response
- [x] **T-3.13** `[!]` Rollback on rejection with the specific inline reason — never a generic error
- [x] **T-3.14** The vote animation sequence (`DESIGN.md` §6.3): press, ring, count roll, icon swap, pip extinguish
- [x] **T-3.15** Rejection shake animation
- [x] **T-3.16** `<QuotaHUD />` in the header: 5 pips, remaining count, next-slot countdown
- [x] **T-3.17** Quota state from a server-provided `nextSlotAt`, re-derived every 30 s — never an accumulating client clock
- [x] **T-3.18** Retraction affordance during the 10-minute window, with the remaining time in the tooltip
- [x] **T-3.19** Anonymous vote → sign-in modal → replay the intended vote after auth (`AC-06.2`)
- [x] **T-3.20** `prefers-reduced-motion` variant: instant state change, feedback preserved

### Idea display

- [x] **T-3.21** `<IdeaCard />` per `DESIGN.md` §7.3, including the qualified variant
- [x] **T-3.22** `/idea/[slug]` — full body, author card, vote control, qualification progress bar
- [x] **T-3.23** `<QualificationBar />` per `DESIGN.md` §7.5 with correct ARIA
- [x] **T-3.24** Verified vs raw vote display when they diverge by more than 10% (`RULES.md` BR-033)
- [x] **T-3.25** Author view: locked vote button with the lock glyph and tooltip

**Exit gate:** all of `US-03`, `US-04`, `US-05` pass. Manual abuse probe — self-vote, double-vote, 6th vote, second submission — all rejected with correct, specific messages.

---

## Phase 4 — Discovery & leaderboard

_Goal: users can find ideas and follow the race. Estimated 6 days._

- [x] **T-4.1** `/feed` RSC with the responsive card grid (1 / 2 / 3 columns)
- [x] **T-4.2** `[!]` Cursor pagination on `(created_at, id)` — not offset, which skips and duplicates rows under concurrent inserts
- [x] **T-4.3** Infinite scroll via `IntersectionObserver`, with a visible "Load more" fallback for keyboard users
- [x] **T-4.4** Sort control: Trending / Newest / Top this cycle, persisted in the URL
- [x] **T-4.5** Trending score: `verified_votes / pow(hours_since_post + 2, 1.5)`, computed in SQL
- [x] **T-4.6** Category and tag filter chips, multi-select, URL-reflected
- [x] **T-4.7** Feed empty states: no results, no ideas at all
- [x] **T-4.8** Skeleton loaders matching the exact card dimensions so nothing shifts on load
- [x] **T-4.9** `[!]` `/leaderboard` — top 20 from `idea_public_stats`, ranked
- [x] **T-4.10** `<LeaderboardRow />` per `DESIGN.md` §7.6, in a semantic `<ol>`
- [x] **T-4.11** `[!]` Realtime subscription on `ideas` filtered by `cycle_id`
- [x] **T-4.12** `[!]` Framer `layout` rank reorder with spring `rank` + the cyan flash for rows that moved up
- [x] **T-4.13** Verify realtime is **not** enabled on `votes` — the ledger must never be published
- [x] **T-4.14** Cycle countdown in the header, local time with the UTC offset
- [x] **T-4.15** `/u/[username]` profile page: authored ideas, votes received, cycles won
- [x] **T-4.16** Landing page: hero, live top 3, the rules stated in three lines, a single CTA
- [x] **T-4.17** `/rules` page generated from `RULES.md`, with anchor IDs matching every `BR-###` so errors can deep-link
- [x] **T-4.18** Full-text search on title + summary (deferrable to post-launch)

**Exit gate:** `US-06` and `US-07` pass. Two browsers open on `/leaderboard`: a vote in one animates the rank change in the other within 2 seconds.

---

## Phase 5 — Cycles & rewards

_Goal: a cycle opens, runs, closes, and pays out without a human touching it. Estimated 5 days._

- [x] **T-5.1** `[!]` Schedule `rotate_cycle()` via `pg_cron` at `0 0 * * 1`
- [x] **T-5.2** Fallback path: `POST /api/cron/rotate-cycle` protected by `CRON_SECRET`, wired to Vercel Cron
- [x] **T-5.3** `[!]` Test `finalize_cycle()` with 0, 1, 3, and 8 qualifying ideas
- [x] **T-5.4** `[!]` Test the `qualified_at` tie-break with two ideas at identical vote counts
- [x] **T-5.5** Test the zero-qualifier path: cycle finalizes cleanly with the public note (`RULES.md` BR-048)
- [x] **T-5.6** Test that a duplicate `open_next_cycle()` call fails on the partial unique index
- [x] **T-5.7** Handle `IP_NO_ACTIVE_CYCLE` during rotation: user-facing message plus one automatic retry after 3 s
- [x] **T-5.8** `/cycles/[n]` archive page — final standings, reward recipients, statically generated after finalization
- [x] **T-5.9** Cycle-close result modal for winners, shown once (`localStorage` flag)
- [x] **T-5.10** The one-time cycle-close sweep animation on qualified rows
- [x] **T-5.11** Rewards section on the profile page
- [x] **T-5.12** Heartbeat row written by `rotate_cycle`; alert if no transition occurs within 30 minutes of the boundary
- [x] **T-5.13** Manually simulate three consecutive cycles on staging by shifting `cycles.ends_at`

**Exit gate:** three consecutive cycles rotate automatically on staging with correct rewards and no manual intervention.

---

## Phase 6 — Trust, safety & admin

_Goal: the operator can see and fix what goes wrong. Estimated 5 days._

- [x] **T-6.1** Report flow: modal, reason select, one report per user per idea
- [x] **T-6.2** Trigger moving an idea to `under_review` at 3 distinct reporters (`RULES.md` BR-037)
- [x] **T-6.3** `/admin` layout with an `is_admin()` server guard and a 404 rewrite for everyone else
- [x] **T-6.4** `/admin/cycles` — active cycle stats, qualifying ideas, a manual finalize button with a confirmation
- [x] **T-6.5** `/admin/reports` — queue, resolve or dismiss, written reason required
- [x] **T-6.6** `/admin/abuse` — `abuse_events` filtered by kind and actor
- [x] **T-6.7** `[!]` Void-vote action writing an `admin_actions` row, with a recount
- [x] **T-6.8** `[!]` Suspend-account action de-verifying active-cycle votes (`RULES.md` BR-004)
- [x] **T-6.9** `recount_required` cycle state and its public banner
- [x] **T-6.10** Ring-detection job: pairwise Jaccard overlap → review queue, **no automatic punishment**
- [x] **T-6.11** `/admin/clusters` — flagged clusters with the signals that triggered them
- [x] **T-6.12** Edge rate limiting (Vercel KV or Upstash) on the limits in `RULES.md` BR-032
- [x] **T-6.13** `ip_hash` with a daily rotating salt; verify no raw IP is ever persisted
- [x] **T-6.14** 180-day retention job purging old `abuse_events`

**Exit gate:** `US-10` passes; a non-admin receives a 404 on every `/admin` route; every admin mutation appears in `admin_actions`.

---

## Phase 7 — Polish, accessibility & performance

_Goal: it feels finished. Estimated 6 days._

### Design completion

- [x] **T-7.1** Audit every screen against the `DESIGN.md` §10 QA checklist
- [x] **T-7.2** Verify no nested `backdrop-filter` anywhere
- [x] **T-7.3** Verify ≤ 12 blurred elements in the viewport on the feed at every breakpoint
- [x] **T-7.4** Every glass panel carries the specular top edge
- [x] **T-7.5** Radius tiers correct by surface size
- [x] **T-7.6** Accent semantics correct: indigo = act, violet = acted, cyan = live
- [x] **T-7.7** Every empty state built (`DESIGN.md` §7.11)
- [x] **T-7.8** Every error state built, specific, and linked to its rule anchor
- [x] **T-7.9** Loading states preserve layout dimensions
- [x] **T-7.10** 404 and 500 pages in the design language

### Accessibility

- [x] **T-7.11** `[!]` Keyboard pass on every flow, pointer unplugged
- [x] **T-7.12** `[!]` Focus ring visible on every interactive element
- [x] **T-7.13** Skip-to-content link as the first tab stop
- [x] **T-7.14** `[!]` Contrast audit against the brightest backdrop behind each glass panel
- [x] **T-7.15** Screen reader pass (VoiceOver + NVDA) on register, submit, vote, leaderboard
- [x] **T-7.16** `aria-live` on vote counts; `role="alert"` on errors
- [ ] **T-7.17** Focus trap and restore on every modal
- [ ] **T-7.18** `[!]` Reduced-motion pass: all feedback preserved, all animation removed
- [ ] **T-7.19** 200% zoom with no horizontal scroll
- [ ] **T-7.20** 44×44 touch targets on coarse pointers
- [ ] **T-7.21** `axe-core` clean on every route

### Performance

- [ ] **T-7.22** Lighthouse ≥ 90 performance, ≥ 95 accessibility on `/`, `/feed`, `/idea/[slug]`, `/leaderboard`
- [ ] **T-7.23** Sustained 50+ fps scroll on the feed on a mid-range Android device
- [ ] **T-7.24** `next/image` everywhere, with correct `sizes`
- [ ] **T-7.25** Bundle analysis; Framer Motion code-split away from first load
- [ ] **T-7.26** `EXPLAIN ANALYZE` on the feed, leaderboard, and quota queries; confirm index usage
- [ ] **T-7.27** p95 vote round-trip under 300 ms measured end-to-end
- [ ] **T-7.28** Caching per `ARCHITECTURE.md` §5.5 verified with cache headers

### Responsive

- [ ] **T-7.29** 360, 390, 768, 1024, 1280, 1920 — no horizontal scroll at any width
- [ ] **T-7.30** Mobile header: quota HUD condensed to pips plus count
- [ ] **T-7.31** Mobile bottom-sheet variant for the vote confirmation modal

**Exit gate:** all Lighthouse targets met, `axe-core` clean, reduced-motion and keyboard passes signed off.

---

## Phase 8 — Launch

_Goal: in production, observable, and recoverable. Estimated 4 days._

### Testing

- [ ] **T-8.1** `[!]` Playwright E2E: register → confirm → submit → vote → hit quota → see the leaderboard
- [ ] **T-8.2** `[!]` E2E abuse suite: self-vote, double-vote, over-quota, second submission — all correctly rejected
- [ ] **T-8.3** Load test: 200 concurrent voters over 5 minutes; assert no over-quota rows
- [ ] **T-8.4** Verify every checkbox in `RULES.md` §9 has a passing test
- [ ] **T-8.5** Cross-browser: Chrome, Safari, Firefox, iOS Safari, Chrome Android — with `backdrop-filter` fallbacks confirmed

### Production Supabase

- [ ] **T-8.6** `[!]` Create the production project; never reuse the dev instance
- [ ] **T-8.7** `[!]` `supabase db push` all migrations; verify RLS is enabled on every table
- [ ] **T-8.8** `[!]` Run the RLS test suite **against production** before any real user exists
- [ ] **T-8.9** Configure production auth: SMTP, redirect URLs, rate limits
- [ ] **T-8.10** Seed cycle 1 with correct `starts_at` / `ends_at` boundaries
- [ ] **T-8.11** Confirm the `pg_cron` schedule exists and is enabled in production
- [ ] **T-8.12** Enable daily backups; document the restore procedure

### Vercel

- [ ] **T-8.13** `[!]` Connect the repo; `main` → production, PRs → previews
- [ ] **T-8.14** `[!]` Set all environment variables per `MEMORY.md` §2; confirm `SUPABASE_SERVICE_ROLE_KEY` is server-scoped only
- [ ] **T-8.15** Custom domain + HTTPS
- [ ] **T-8.16** Security headers: CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`
- [ ] **T-8.17** Vercel Cron entry as the `pg_cron` fallback
- [ ] **T-8.18** Preview deployments pointed at a staging Supabase project, never production

### Observability

- [ ] **T-8.19** Sentry for client and server errors, with release tagging
- [ ] **T-8.20** Vercel Analytics + Speed Insights
- [ ] **T-8.21** Alert: cycle failed to rotate within 30 minutes of the boundary
- [ ] **T-8.22** Alert: `abuse_events` rate spikes above 3× the rolling baseline
- [ ] **T-8.23** Alert: p95 vote latency above 800 ms
- [ ] **T-8.24** Uptime check on `/` and `/api/health`

### Launch readiness

- [ ] **T-8.25** `/rules` live and matching `RULES.md` exactly
- [ ] **T-8.26** Privacy policy and terms published
- [ ] **T-8.27** `robots.txt`, `sitemap.xml`, OpenGraph images for ideas and cycles
- [ ] **T-8.28** Support email routed and monitored
- [ ] **T-8.29** Rollback procedure documented and rehearsed once
- [ ] **T-8.30** Seed a launch cohort so cycle 1 has enough voters for the threshold to be reachable
- [ ] **T-8.31** `[!]` Post-launch watch: monitor `abuse_events` hourly for the first 48 hours

**Exit gate:** cycle 1 opens in production, the first idea is submitted and voted on, and `abuse_events` contains no unexplained entries after 48 hours.

---

## Post-launch backlog

Not committed for v1. Ordered by expected value.

- [ ] Comments on ideas, with their own rate limits
- [ ] Email digest: cycle opening, your idea's rank, cycle results
- [ ] Follow an author; notification when they post
- [ ] Idea collections and curated lists
- [ ] Public read-only API with key-based rate limits
- [ ] Reward fulfillment integration (Stripe Connect or credits)
- [ ] Multi-region cycle boundaries
- [ ] Idea revision history with a public diff
- [ ] Automated ring-detection escalation (only after 3+ months of human-reviewed baseline data)
- [ ] Native mobile apps

---

## Estimation summary

| Phase                   | Days | Cumulative |
| ----------------------- | ---- | ---------- |
| 0 — Foundation          | 3    | 3          |
| 1 — Database & security | 5    | 8          |
| 2 — Authentication      | 4    | 12         |
| 3 — Core loop           | 8    | 20         |
| 4 — Discovery           | 6    | 26         |
| 5 — Cycles & rewards    | 5    | 31         |
| 6 — Trust & admin       | 5    | 36         |
| 7 — Polish              | 6    | 42         |
| 8 — Launch              | 4    | 46         |

**46 working days ≈ 9–10 calendar weeks** for one developer, or 7–8 weeks with Phase 4 and Phase 6 running in parallel across two.
