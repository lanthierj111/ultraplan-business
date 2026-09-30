# AI Code Review

Automated pull-request review for GitHub. Every PR gets inline findings — security flaws, real
bugs and maintainability problems — posted on the exact lines that caused them.

**Live:** https://ai-code-review-bot-five.vercel.app
**Install:** https://github.com/apps/ai-code-review-bot-jacobnovus

---

## What it does

GitHub sends a webhook for every opened, synchronised or reopened pull request. The app fetches
only the diff, reviews the changed lines with an LLM, and posts the results as a GitHub check run
with inline annotations.

Real output from a test pull request — five deliberate defects, five findings:

```
AI Code Review — 5 issues found (3 critical, 2 major) · reviewed in 32s

  security-issues.js:4   critical  Hardcoded admin password in source code.
  security-issues.js:8   critical  MD5 used for password hashing.
  security-issues.js:13  critical  Command injection via user-supplied host.
  security-issues.js:18  major     Unbounded recursion → stack overflow / DoS.
  security-issues.js:23  major     Assignment (=) used instead of comparison (===).
```

---

## Architecture

```
PR opened / synchronised / reopened
  │
  ├─ GitHub webhook            HMAC-SHA256 signature verified, 401 otherwise
  │
  └─ Vercel function  /api/webhook
       ├─ mint app JWT            RS256, app private key
       ├─ exchange for token      installation access token, cached 1h
       ├─ fetch PR files + diff   installation token (Checks API refuses user tokens)
       ├─ review in parallel      NVIDIA Nemotron 3 Ultra, one call per file
       └─ post check run          inline annotations, capped at 50
```

### Files

| Path | Role |
|---|---|
| `src/app/api/webhook/route.ts` | Webhook entry point, signature verification |
| `src/lib/app-auth.ts` | App JWT → installation token, with caching |
| `src/lib/github.ts` | Diff/files fetch and check-run creation |
| `src/lib/nemotron.ts` | Model client, JSON parsing, per-call timeout |
| `src/lib/review.ts` | Orchestration: file caps, parallel review, wall-clock budget |
| `src/app/page.tsx` | Landing page |

---

## Design constraints

These shaped the implementation and are worth knowing before changing it:

- **Vercel Hobby caps a function at 60 s.** A review must finish well inside that, so the code
  caps the number of files (3), the prompt size per file (12 000 chars), the model call (35 s)
  and the whole review (45 s). Exceeding any cap degrades gracefully instead of timing out.
- **The Checks API requires an installation token.** A personal access token returns
  `403 You must authenticate via a GitHub App.` Every repository call is authenticated as the
  installation.
- **Inference endpoints are variable.** The same prompt can take 1 s or 30 s. Retries and
  fallbacks matter more than model choice, which is why the timeout is per call.
- **GitHub rejects the whole check run if one annotation is invalid.** Annotations are capped
  and a summary-only retry is the fallback.

---

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

| Variable | Purpose |
|---|---|
| `GITHUB_APP_ID` | The app's numeric ID |
| `GITHUB_PRIVATE_KEY` | PEM private key (real newlines) |
| `GITHUB_WEBHOOK_SECRET` | Shared secret for webhook signature verification |
| `NVIDIA_API_KEY` | Used for the review model calls |

Webhook testing needs a public URL; `smee.io` or a tunnel works. Register the URL as the app's
webhook endpoint and subscribe to the **Pull requests** event.

---

## Deploy

```bash
vercel --prod
```

Set the four environment variables above in the Vercel project. Then, in the GitHub App settings:

- **Permissions** — Pull requests: read · Contents: read · Metadata: read
- **Events** — Pull requests
- **Webhook URL** — `https://<your-deployment>/api/webhook`

---

## Licence

MIT.
