# Loop 1 — GROW plan

Goal for this phase: turn a working product into **first users**, then **first dollar**.

Target: 100 visitors/day → first signup → first paying customer.

---

## State at the start of GROW

| Item | Status |
|---|---|
| Product | ✅ Working end-to-end (5/5 defects detected, 32 s review) |
| Public URL | ✅ https://ai-code-review-bot-five.vercel.app |
| Landing page | ✅ Built (hero, how it works, what it catches, pricing, FAQ) |
| README | ✅ Written with real output |
| Marketplace copy | ✅ Drafted in `docs/marketplace-listing.md` |
| Users | ❌ 0 |
| Revenue | ❌ $0 |

---

## Week 1 — make it installable by a stranger

| # | Task | Owner | Done when |
|---|---|---|---|
| 1 | Make the GitHub App **public** | human | App settings shows "Public" |
| 2 | Add a logo (512×512) and screenshots | agent + human | Assets committed and uploaded |
| 3 | Tighten `contents` to **read-only** | human | Installation permissions show read |
| 4 | Narrow repository access to **selected** | human | Installation shows the chosen repos |
| 5 | Verify a **fresh install** by a second account | human | Review appears on a stranger's PR |
| 6 | Add an `INSTALL` link to the landing hero | agent | Deployed |

**Gate:** a stranger can install and get a review without talking to me.

---

## Week 2 — distribution where developers already are

| # | Task | Channel | Why it works |
|---|---|---|---|
| 7 | Publish the Marketplace listing (draft) | GitHub Marketplace | Built-in distribution to the exact audience |
| 8 | "Show HN" post | Hacker News | High-intent developer traffic, honest feedback |
| 9 | Dev.to article: *"We planted 5 bugs and let an AI reviewer find them"* | SEO + community | The test output is the story — concrete, verifiable |
| 10 | r/github + r/devops posts | Reddit | Direct audience, low effort |
| 11 | Reach out to 10 small OSS maintainers | Direct | Free plan for their repo, ask for a quote |
| 12 | Submit to "AI dev tools" directories | SEO | Backlinks + long-tail discovery |

**Gate:** 100 visitors/day, first non-me install.

---

## Week 3 — convert

| # | Task | Detail |
|---|---|---|
| 13 | Add a free-plan cap counter | 100 reviews/month, visible in the check summary |
| 14 | Add the upgrade CTA inside the check run output | Only when the cap is near |
| 15 | Instrument the funnel | Visits → install → first review → upgrade |
| 16 | Interview the first 3 users | What made them install, what nearly stopped them |

**Gate:** first paying customer ($19).

---

## Week 4 — compound

| # | Task | Detail |
|---|---|---|
| 17 | Ship **custom review rules** (the Pro hook) | `.ai-review.yml` in the repo |
| 18 | Publish the case study with real numbers | "reviewed N PRs, found M issues" |
| 19 | Raise the file cap by moving to Pro hosting | Vercel Pro removes the 60 s ceiling |
| 20 | Write the loop-1 retrospective | What worked, what to avoid in Loop 2 |

**Gate:** $100 MRR, then decide: scale this, or start Loop 2.

---

## Metrics to watch

| Metric | Target | Where |
|---|---|---|
| Visitors / day | 100 | Vercel analytics |
| Installs | 25 | GitHub App page |
| Reviews run | 500 | check-run count |
| Free → Pro conversion | 4 % | billing |
| Time to first review (new install) | < 5 min | funnel |

---

## Known blockers to clear early

1. **The app must be public.** Marketplace listing is impossible while it is private.
2. **Repository access is currently "all repositories".** A stranger installing it hands over
   everything — that will kill the install at the permission screen. Must be "selected".
3. **`contents: write` is not needed.** Asking for write access on contents is a red flag for
   security-conscious teams. Downgrade to read.
4. **The 60 s function cap** limits very large pull requests. Documented as a known limit on the
   free plan; Pro hosting removes it.

---

## The one sentence that sells this

> It reads the diff and puts the problem on the exact line that caused it, in about thirty
> seconds, before a human spends time on it.
