# AI Code Review Bot

Autonomous GitHub App that reviews every PR using NVIDIA Nemotron 3 Ultra.

## Architecture

```
PR opened/synced → GitHub webhook → Vercel (Next.js API)
  → Fetch diff via GitHub API
  → Send to Nemotron 3 Ultra (NVIDIA NIM)
  → Parse structured JSON review
  → Post via GitHub Checks API
```

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Hosting:** Vercel (Edge functions for webhook)
- **AI:** NVIDIA Nemotron 3 Ultra 550B (via `integrate.api.nvidia.com/v1`)
- **GitHub:** Octokit REST + Webhooks
- **CI/CD:** GitHub Actions → Vercel deploy

## Setup

1. Create GitHub App:
   - Permissions: `pull_requests` (read/write), `checks` (read/write), `contents` (read)
   - Webhook URL: `https://your-app.vercel.app/api/webhook`
   - Events: `pull_request` (opened, synchronize, reopened)

2. Environment variables (Vercel):
   ```
   GITHUB_APP_ID=xxx
   GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
   GITHUB_WEBHOOK_SECRET=xxx
   GITHUB_TOKEN=gho_xxx
   NVIDIA_API_KEY=nvapi_xxx
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

## Local Development

```bash
npm install
npm run dev
# Webhook testing: use ngrok or smee.io
```

## Webhook Payload Handling

- `pull_request.opened` → full review
- `pull_request.synchronize` → incremental review (new commits)
- `pull_request.reopened` → full review

## Review Output

GitHub Checks API with annotations:
- ✅ Success: no critical/major issues
- ❌ Failure: critical or major issues found
- 📝 Annotations: inline on diff lines

## Extending

Add custom rules in `src/lib/review.ts` → `SYSTEM_PROMPT`.