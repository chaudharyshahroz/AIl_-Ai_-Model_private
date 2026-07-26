# Admin Guide

> How to use the admin dashboard at `/admin`.

The admin area is gated by `User.isAdmin` — only admins can access it. To make yourself an admin:

```bash
docker exec -it reklu-db psql -U reklu -d reklu \
  -c "UPDATE \"User\" SET \"isAdmin\" = true WHERE email = 'you@example.com';"
```

Admins see a yellow banner across the top of the admin area at all times. The user menu in the app sidebar includes an "Admin" shortcut for admins.

## Sections

### Overview (`/admin`)

System dashboard with:
- User / conversation / 30-day cost counts
- Provider health (live ping to each configured provider)
- Top 5 users by spend
- Recent activity (last 10 events)
- New users in the last 24 hours

### Users (`/admin/users`)

Search, view, and act on every user:
- **Search** by name or email
- **+ $5** button grants 5 USD in credits (writes a `CreditLedgerEntry`)
- **Make admin / Revoke admin** promotes or demotes
- **Suspend / Unsuspend** blocks sign-in without deleting the account
- All actions write to `AuditLog`

### API Keys (`/admin/providers`)

Manage the deployment's system-wide AI provider keys:
- **Add a key** for any provider — the key is validated by calling the provider's API before saving
- **Test** an existing key (re-validates it)
- **Remove** revokes the key (next chat request will fall back to env var if set, else fail)
- Keys are encrypted with AES-256-GCM and never returned to the browser
- Every action writes to `AuditLog`

This is the only place provider keys are managed. **Users do not bring their own keys in this build** — billing and rate limits stay under admin control.

### Models (`/admin/models`)

Control the model registry:
- **Sync** fetches the latest catalog from the provider API and adds new models (in `disabled` state — admin must enable them)
- **Enable / Disable** controls whether the model appears in the user-facing selector
- **Edit pricing** overrides the list price (use this to apply a discount or markup per model)
- Per-model capabilities are read-only (they come from the provider)

### Skills (`/admin/skills`)

Phase 4. Shows the planned skill catalog and what you can do today (use system prompts in chat to simulate skills).

### Usage (`/admin/usage`)

System-wide usage analytics:
- Total cost / tokens / requests / cached tokens
- Daily cost bar chart (7/30/90/180-day windows)
- Breakdown by provider, model, organization, and user

### System health (`/admin/health`)

Live ping of every configured provider:
- Latency per provider
- Health status (healthy / down with error)
- 24-hour error rate
- Database connectivity

### Audit log (`/admin/audit`)

Last 200 admin actions, newest first. Every state change (user suspend, key add/remove, model enable/disable, credit grant, etc.) writes here.

## Security notes

- Admin pages require `User.isAdmin = true`. Without it, the user is redirected to `/app/chat?denied=admin`.
- Admin actions run through `requireAdmin()` server-side, not just hidden in the UI.
- All admin actions are recorded in `AuditLog` with the actor's user id.
- API keys are encrypted at rest. Even with full DB access, an attacker needs `ENCRYPTION_KEY` to decrypt them.

## What you can do today vs. what's coming

| Feature | Status |
|---|---|
| Manage users | ✅ Live |
| Suspend / restore users | ✅ Live |
| Grant credits | ✅ Live |
| Add / remove API keys | ✅ Live |
| Test API key | ✅ Live |
| Sync model catalog from provider | ✅ Live |
| Enable / disable models | ✅ Live |
| Edit model pricing | ✅ Live |
| System usage analytics | ✅ Live |
| System health monitoring | ✅ Live |
| Audit log | ✅ Live |
| Skill management | ⏳ Phase 4 |
| Stripe billing | ⏳ Phase 8 |
| Impersonate user (with warning) | ⏳ Phase 10 |
| Bulk email users | ⏳ Phase 10 |
