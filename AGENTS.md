# AGENTS.md — IdeaPulse

Standing instructions for any AI coding agent working in this repository.

---

## Specification files are the source of truth

This repo contains six specification documents. Read them before any task:

| File              | Authority                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `PRD.md`          | What we're building, features, user stories, acceptance criteria                             |
| `ARCHITECTURE.md` | Schema, RLS policies, RPC functions, API flows — **authoritative, copy the SQL as written**  |
| `RULES.md`        | Business rules with enforcement class and error codes — **authoritative, never reinterpret** |
| `DESIGN.md`       | Design tokens, components, motion specs — **authoritative, copy the token values exactly**   |
| `TASKS.md`        | The build order. Work tasks in sequence by ID.                                               |
| `MEMORY.md`       | Current state, env vars, architectural decisions (ADRs), changelog                           |

**Precedence:** `RULES.md` > `ARCHITECTURE.md` > `DESIGN.md` > `PRD.md` > your own judgment.

If a spec is ambiguous or you believe it's wrong, **stop and ask**. Do not resolve the ambiguity yourself and keep going. If you find a genuine conflict between two files, say so and propose a fix — don't silently pick one.

---

## Working method

1. Take the next unchecked task in `TASKS.md`, in ID order. Don't skip ahead.
2. Before writing code, state which task IDs you're doing and your plan. Wait for approval.
3. Implement. Write the test named in the task if one is named.
4. Run typecheck, lint, and tests. Fix failures before reporting done.
5. Check the task off in `TASKS.md` and update `MEMORY.md` §1 (phase, progress, next action).
6. Stop at the phase **exit gate**. Do not start the next phase without explicit approval.

Work in batches of 3–6 related tasks, not one at a time and not a whole phase at once.

Reference task IDs in commit messages: `feat(votes): cast_vote RPC [T-1.15]`.

---

## Hard constraints

Violating these breaks the product. They are not style preferences.

### Database

- Every business rule is enforced in PostgreSQL. Client-side validation exists to produce fast error messages and is never the enforcement point.
- **Do NOT drop `ideas_id_author_uk`** (`UNIQUE (id, author_id)` on `ideas`). It looks redundant next to the primary key. It is the foreign-key target that makes self-vote prevention expressible as a `CHECK` constraint. See ADR-002 in `MEMORY.md`.
- Copy the SQL in `ARCHITECTURE.md` verbatim. Do not "simplify" constraints, triggers, or RLS policies. Do not replace a `CHECK` with a trigger — a trigger can be disabled, a `CHECK` cannot.
- The vote quota query counts `status in ('active','retracted')`. This is deliberate, not a bug. See ADR-004.
- `cast_vote` must take the advisory lock **before** counting votes. See ADR-007.
- Never enable Realtime on the `votes` table. `ideas` only. Publishing the vote ledger leaks who voted for what. See ADR-006.
- `DELETE` stays revoked on `votes` for all client roles. The ledger is append-only.
- `is_verified` is computed server-side at insert and frozen. Never client-settable. See ADR-005.

### Security

- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix with `NEXT_PUBLIC_`, never import into a file reachable from a `'use client'` component.
- Server Actions carry the user's session and do **not** escalate privilege. RLS is the only authorization mechanism on every path. See ADR-011.
- RLS enabled on every table. A table with RLS on and no matching policy denies by default — that's intended, not a bug to fix.
- Column grants on `profiles` limit `authenticated` to `display_name`, `bio`, `avatar_url`, `username`. Do not widen them.
- Never persist a raw IP address. Use the daily-rotating `ip_hash`. See `RULES.md` BR-035.

### Design

- Use the exact token values in `DESIGN.md` §9. Don't approximate hex values or invent new ones.
- Never nest `backdrop-filter` — a blurred element inside another blurred element.
- Maximum 12 blurred elements in the viewport at once.
- Never animate `backdrop-filter`. Animate `transform` and `opacity` only.
- Dark mode only. Ignore `prefers-color-scheme: light`. See ADR-010.
- Every glass panel gets the `inset 0 1px 0 var(--edge-specular)` top highlight.
- Accent grammar: **indigo** = you can act, **violet** = you have acted, **cyan** = live number. Don't use them decoratively.
- Every interactive element needs a visible focus ring and a `prefers-reduced-motion` path that preserves feedback while removing animation.
- Radius encodes hierarchy — bigger surface, larger radius. Don't flatten everything to one value.

### Process

- Don't invent features that aren't in `PRD.md`.
- Don't add dependencies not listed in `TASKS.md` without asking.
- Any structural decision you make gets a new ADR appended to `MEMORY.md` §3. Never edit an existing ADR — supersede it with a new one.
- Error messages come from `RULES.md` §7. Never write a generic "something went wrong" — every failure names what happened and what to do next.
- Don't skip the pgTAP tests in Phase 1 to move faster. T-1.27 through T-1.30 are what prove the anti-abuse rules actually hold.

---

## Environment

Local dev requires `supabase start`. Migrations live in `supabase/migrations/`, applied with `supabase db reset` locally before `supabase db push` to a remote project.

Regenerate types after every migration:

```bash
supabase gen types typescript --local > lib/database.types.ts
```

Stale types pass typecheck and fail at runtime. CI regenerates and diffs them.

### Commands

```bash
npm run dev          # Next.js dev server
npm run typecheck
npm run test         # Vitest
npm run test:e2e     # Playwright
supabase start
supabase db reset    # Rebuild from migrations + seed — destroys local data
```

### Local URLs

| Service              | URL                    |
| -------------------- | ---------------------- |
| App                  | http://localhost:3000  |
| Supabase Studio      | http://127.0.0.1:54323 |
| Inbucket (dev email) | http://127.0.0.1:54324 |
| API                  | http://127.0.0.1:54321 |

---

## When something breaks

Check these first, in this order:

1. **Wrong vote count** → `sync_vote_counters` trigger, especially around `is_verified` changes and `qualified_at`.
2. **Slow scrolling** → count blurred elements in the viewport before investigating anything else.
3. **Cycle didn't close** → `pg_cron` job log, then the heartbeat row, then whether `finalize_cycle` threw.
4. **Login broken after deploy** → `NEXT_PUBLIC_SITE_URL` not matching Supabase's redirect allowlist.
5. **Runtime error that typecheck missed** → regenerate `database.types.ts`.
