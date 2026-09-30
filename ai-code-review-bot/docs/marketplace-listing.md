# Marketplace listing — draft copy

Paste-ready text for the GitHub Marketplace submission form.
Marketplace listing requires the app to be **public** (currently private).

---

## Name

`AI Code Review`

## Tagline (≤ 60 chars)

`Inline AI review on every pull request`

## Short description (≤ 120 chars)

`Reviews each pull request and annotates security flaws, bugs and maintainability issues on the exact changed lines.`

## Long description

**Every pull request gets a first pass before a human reads it.**

AI Code Review connects to a repository and reviews pull requests automatically. It reads only the
diff — the lines that actually changed — and posts its findings as a GitHub check run with inline
annotations, so a reviewer sees each issue on the line that caused it.

**What it looks for**

- **Security** — leaked credentials, SQL and command injection, unsafe deserialisation, broken
  hashing, missing authorisation checks.
- **Correctness** — off-by-one errors, wrong operators, swallowed exceptions, unhandled edge
  cases, logic that contradicts its own intent.
- **Maintainability** — dead code, duplicated logic, missing tests around risky paths, unclear
  control flow.

Each finding names a severity (`critical`, `major`, `minor`, `suggestion`), points at a line, and
suggests a concrete fix.

**What it does not do**

It does not read the whole repository, does not store your code, and does not decide whether a
pull request may merge. It reports; your branch protection rules decide.

**How it runs**

A pull request triggers a webhook. The service fetches the diff, reviews files in parallel, and
posts the result. A typical review completes in about 30 seconds.

**Free plan**

One repository, 100 reviews per month, inline annotations. No card required.

## Categories

- Code quality
- Code review
- Security

## Pricing plan

| Plan | Price | Includes |
|---|---|---|
| Free | $0 | 1 repository, 100 reviews/month, inline annotations |
| Pro | $19/month | Unlimited repositories, unlimited reviews, custom rules, priority queue |
| Team | $99/month | Pro plus organisation install, audit log, SSO, self-hosted option |

## Setup URL

`https://ai-code-review-bot-five.vercel.app`

## Callback / Homepage

`https://ai-code-review-bot-five.vercel.app`

---

## Pre-submission checklist

- [ ] Make the app **public** (App settings → scroll to the bottom → Make public)
- [ ] Verify the app has a logo (512×512 PNG)
- [ ] Add the four required screenshots / demo GIF
- [ ] Confirm the pricing plans above are configured in the Marketplace billing settings
- [ ] Test the install flow with a fresh account
- [ ] Confirm the uninstall flow works and stops all API calls
