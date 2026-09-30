const GITHUB_APP_URL = 'https://github.com/apps/ai-code-review-bot-jacobnovus';

export default function Page() {
  return (
    <div>
      <div className="wrap">
        <div className="nav">
          <div className="brand">
            <span className="dot" />
            AI Code Review
          </div>
          <nav>
            <a href="#how">How it works</a>
            <a href="#catches">What it catches</a>
            <a href="#pricing">Pricing</a>
            <a href={GITHUB_APP_URL}>Install</a>
          </nav>
        </div>

        <section className="hero">
          <span className="eyebrow">GitHub App · no configuration required</span>
          <h1>
            Every pull request gets <span className="grad">a senior review</span> in 30 seconds.
          </h1>
          <p className="lede">
            Install the app and it reviews each pull request automatically. Security flaws, real
            bugs and maintainability problems are posted as inline annotations on the exact lines
            that caused them — before a human spends time reading the diff.
          </p>
          <div className="cta">
            <a className="btn primary" href={GITHUB_APP_URL}>
              Install on GitHub
            </a>
            <a className="btn" href="#how">
              See how it works
            </a>
          </div>
        </section>
      </div>

      <div className="wrap">
        <section className="section" id="how">
          <h2>How it works</h2>
          <p className="sub">Three moving parts. Nothing to deploy, nothing to maintain.</p>
          <div className="grid c3">
            <div className="card">
              <div className="step">STEP 1</div>
              <h3>A PR opens</h3>
              <p>
                GitHub sends a webhook for every opened, synchronised or reopened pull request. No
                polling, no cron, no wasted API calls.
              </p>
            </div>
            <div className="card">
              <div className="step">STEP 2</div>
              <h3>The diff is analysed</h3>
              <p>
                Only the changed lines are sent to the model, file by file, in parallel. The review
                targets what actually changed, not the whole repository.
              </p>
            </div>
            <div className="card">
              <div className="step">STEP 3</div>
              <h3>Findings land on the diff</h3>
              <p>
                Results are posted as a GitHub check run with inline annotations, so a reviewer sees
                every issue on the line it belongs to.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="catches">
          <h2>What it catches</h2>
          <p className="sub">
            Real output from a test pull request — five deliberate defects, five findings.
          </p>
          <pre className="diff">{`AI Code Review — 5 issues found (3 critical, 2 major) · reviewed in 32s

  security-issues.js:4   critical  Hardcoded admin password in source code
                                   (ADMIN_PASSWORD = "admin123!") exposes credentials
                                   to anyone with access to the codebase.

  security-issues.js:8   critical  MD5 used for password hashing. MD5 is cryptographically
                                   broken and unsuitable for password storage.

  security-issues.js:13  critical  Command injection: user-supplied \`host\` is concatenated
                                   into a shell command without validation.

  security-issues.js:18  major     Unbounded recursion in \`countdown\` for negative input
                                   (no base case) → stack overflow and potential DoS.

  security-issues.js:23  major     Assignment (=) used instead of comparison (===) in
                                   \`if (flag = true)\` — always true, flag ignored.`}</pre>
          <div className="grid c3" style={{ marginTop: 16 }}>
            <div className="card">
              <h3>Security</h3>
              <p>
                Leaked secrets, SQL and command injection, unsafe deserialisation, broken crypto,
                missing authorisation checks.
              </p>
            </div>
            <div className="card">
              <h3>Correctness</h3>
              <p>
                Off-by-one errors, wrong operators, swallowed exceptions, unhandled edge cases,
                logic that contradicts its own intent.
              </p>
            </div>
            <div className="card">
              <h3>Maintainability</h3>
              <p>
                Dead code, duplicated logic, missing tests around risky paths, and unclear control
                flow that will bite later.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <h2>Pricing</h2>
          <p className="sub">Start free. Upgrade when the bot becomes part of your review habit.</p>
          <div className="grid c3">
            <div className="card price">
              <h3>Free</h3>
              <div className="amount">
                $0 <span>forever</span>
              </div>
              <ul>
                <li>1 repository</li>
                <li>100 reviews / month</li>
                <li>Inline annotations</li>
                <li>Community support</li>
              </ul>
            </div>
            <div className="card price featured">
              <h3>Pro</h3>
              <div className="amount">
                $19 <span>/ month</span>
              </div>
              <ul>
                <li>Unlimited repositories</li>
                <li>Unlimited reviews</li>
                <li>Custom review rules</li>
                <li>Priority queue</li>
                <li>Email support</li>
              </ul>
            </div>
            <div className="card price">
              <h3>Team</h3>
              <div className="amount">
                $99 <span>/ month</span>
              </div>
              <ul>
                <li>Everything in Pro</li>
                <li>Organisation-wide install</li>
                <li>Audit log + SSO</li>
                <li>Self-hosted option</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section faq">
          <h2>Questions</h2>
          <p className="sub">&nbsp;</p>
          <details>
            <summary>Does it read my whole repository?</summary>
            <p>
              No. It requests only the diff of the pull request, file by file. Nothing else is
              fetched and nothing is stored after the review completes.
            </p>
          </details>
          <details>
            <summary>How fast is a review?</summary>
            <p>
              Around 30 seconds for a typical pull request. Reviews run in parallel per file, so a
              multi-file change does not multiply the wait.
            </p>
          </details>
          <details>
            <summary>Will it block my pull request?</summary>
            <p>
              It reports a failing check when it finds a critical or major issue. Whether that
              blocks a merge is up to your branch protection rules — you decide.
            </p>
          </details>
          <details>
            <summary>Can it be wrong?</summary>
            <p>
              Yes. Treat it as a first pass that removes the obvious from a human&apos;s plate, not
              as an authority. Findings include a suggested fix so you can judge quickly.
            </p>
          </details>
        </section>

        <footer>
          <span>AI Code Review — automated pull-request review.</span>
          <span>
            <a href={GITHUB_APP_URL}>Install</a> · <a href="#pricing">Pricing</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
