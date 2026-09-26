# Support Operations & Email Routing Runbook [T-8.28]

This runbook specifies the routing, monitoring, SLA tiers, and resolution workflows for the primary IdeaPulse support inbox: `support@ideapulse.dev`.

---

## 1. Inbox Architecture & Inbound Routing

| Component                    | Specification                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Primary Address**          | `support@ideapulse.dev`                                                                                |
| **DNS MX Provider**          | Google Workspace / Cloudflare Email Routing                                                            |
| **Inbound Forwarding**       | Forwarded to on-call engineering & community operations distribution list (`ops-oncall@ideapulse.dev`) |
| **Helpdesk Sync**            | Bi-directional webhook into support ticketing system (Linear / Zendesk / GitHub Discussions)           |
| **Notification Integration** | Discord/Slack `#alerts-support` channel for high-priority inbound emails                               |

---

## 2. Response SLAs by Issue Severity

| Severity Level                      | Examples                                                                               | Target First Response | Target Resolution |
| ----------------------------------- | -------------------------------------------------------------------------------------- | --------------------- | ----------------- |
| **P0: Security & Anti-Cheat Alert** | Account takeover, false-positive account suspension appeal, active Sybil ring breach   | < 2 hours             | < 8 hours         |
| **P1: Voting & Cycle Blocking**     | Email verification failures, wallet/payout credential errors, unhandled RPC exceptions | < 4 hours             | < 24 hours        |
| **P2: Content & Idea Inquiries**    | Content withdrawal requests, tag correction, clarification on `RULES.md`               | < 12 hours            | < 48 hours        |
| **P3: General Platform Feedback**   | Feature requests, UI improvements, partnership proposals                               | < 24 hours            | < 5 business days |

---

## 3. Standard Operating Procedures (SOPs)

### SOP-01: False-Positive Suspension Appeals

1. Verify sender email matches the `auth.users.email` of the suspended account.
2. Query `abuse_events` table for entries associated with the `user_id`:
   ```sql
   SELECT id, abuse_type, details, created_at
   FROM public.abuse_events
   WHERE user_id = '<user-id>'
   ORDER BY created_at DESC;
   ```
3. If suspension was triggered erroneously (e.g. university proxy cluster triggering multiple accounts on single daily hash):
   - Admin unbans user in Supabase Studio (`status = 'active'`).
   - Trigger audit entry in `admin_audit_logs`.
   - Reply to user with restoration confirmation.

### SOP-02: Email Confirmation Link Issues

1. In development, inspect Inbucket at `http://127.0.0.1:54324`.
2. In production, check Supabase Auth SMTP logs. If rate-limited by user ISP, generate an admin magic-link or email confirm token directly via Supabase Auth Admin API.

### SOP-03: Intellectual Property & Take-Down Requests

1. All proposals are subject to `RULES.md` and Terms of Incubation §4.
2. If legitimate copyright infringement is reported:
   - Admin transitions proposal status to `'removed'` via admin dashboard (`/admin/reports`).
   - Log rationale in moderation notes.
   - Reply to claimant with confirmation notice.

---

## 4. Monitoring & On-Call Handoff

- **Health Checks:** On-call team validates receiving of test ping emails every Monday morning at 09:00 UTC.
- **Weekly Triage:** Weekly review of all incoming tickets to identify systemic UX stumbling blocks or confusing error messages.
