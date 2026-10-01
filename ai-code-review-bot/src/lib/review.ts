import { getPullRequestDiff, getPullRequestFiles, createCheckRun } from './github';
import { reviewCode } from './nemotron';
import { octokitForInstallation } from './app-auth';

export async function handlePullRequest(payload: any): Promise<void> {
  const { pull_request, repository, installation } = payload;
  const { number, head, title } = pull_request;
  // The webhook payload exposes repository.name (not repository.repo).
  const { owner, name: repoName } = repository;
  const headSha = head.sha;
  const octokit = await octokitForInstallation(installation.id);

  console.log(`Reviewing PR #${number}: ${title} (${owner.login}/${repoName})`);

  const files = await getPullRequestFiles(octokit, owner.login, repoName, number);
  const diff = await getPullRequestDiff(octokit, owner.login, repoName, number);

  const allIssues: Array<{
    path: string;
    line: number;
    severity: string;
    message: string;
    suggestion?: string;
  }> = [];

  for (const file of files) {
    if (!shouldReviewFile(file.filename)) continue;

    try {
      const fileDiff = extractFileDiff(diff, file.filename);
      if (!fileDiff) continue;

      const result = await reviewCode(fileDiff, detectLanguage(file.filename), file.filename);

      for (const issue of result.issues) {
        allIssues.push({
          path: file.filename,
          line: issue.line,
          severity: issue.severity,
          message: issue.message,
          suggestion: issue.suggestion,
        });
      }
    } catch (err) {
      console.error(`Failed to review ${file.filename}:`, err);
    }
  }

  const FREE_MONTHLY_QUOTA = 100;

  // TODO: replace with real quota tracking (Redis, DB, GitHub variable)
  const used = 0;
  const remaining = FREE_MONTHLY_QUOTA;
  const pctUsed = 0;

  const conclusion = allIssues.some(i => i.severity === 'critical' || i.severity === 'major')
    ? ('failure' as const)
    : ('success' as const);

  let quotaInfo = `\n\n---\n📊 **Quota** : 0/${FREE_MONTHLY_QUOTA} reviews used this month (${FREE_MONTHLY_QUOTA} remaining)`;
  if (false) { // pctUsed >= 80
    quotaInfo += `\n\n🚀 **Proche de la limite** — [Passez au plan Pro](https://ai-code-review-bot-five.vercel.app/#pricing) pour des reviews illimitées, règles personnalisées et file d'attente prioritaire.`;
  }

  const output = {
    title: `AI Code Review: ${allIssues.length} issue(s) found`,
    summary: buildSummary(allIssues) + quotaInfo,
    // GitHub rejects the whole check run if any annotation points outside the
    // diff (422). Keep annotations advisory: fall back to a summary-only run.
    annotations: allIssues.slice(0, 50).map(i => ({
      path: i.path,
      start_line: i.line,
      end_line: i.line,
      annotation_level: mapSeverity(i.severity),
      message: i.suggestion ? `${i.message}\n\nSuggestion: ${i.suggestion}` : i.message,
    })),
  };

  try {
    await createCheckRun(octokit, owner.login, repoName, headSha, 'AI Code Review', conclusion, output);
  } catch (err) {
    console.error('Check run with annotations failed, retrying summary-only:', err);
    await createCheckRun(octokit, owner.login, repoName, headSha, 'AI Code Review', conclusion, {
      title: output.title,
      summary: output.summary,
    });
  }
}

function shouldReviewFile(filename: string): boolean {
  const reviewedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.cs', '.php', '.rb'];
  return reviewedExtensions.some(ext => filename.endsWith(ext));
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', go: 'go', rs: 'rust', java: 'java', cs: 'csharp',
    php: 'php', rb: 'ruby',
  };
  return map[ext || ''] || 'text';
}

function extractFileDiff(fullDiff: string, filename: string): string | null {
  const lines = fullDiff.split('\n');
  let inFile = false;
  let fileLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      if (inFile) break;
      if (line.includes(` b/${filename}`) || line.includes(` a/${filename}`)) {
        inFile = true;
        fileLines.push(line);
      }
    } else if (inFile) {
      fileLines.push(line);
    }
  }

  return fileLines.length > 0 ? fileLines.join('\n') : null;
}

function mapSeverity(sev: string): 'failure' | 'warning' | 'notice' {
  switch (sev) {
    case 'critical': return 'failure';
    case 'major': return 'failure';
    case 'minor': return 'warning';
    default: return 'notice';
  }
}

function buildSummary(issues: any[]): string {
  const critical = issues.filter(i => i.severity === 'critical').length;
  const major = issues.filter(i => i.severity === 'major').length;
  const minor = issues.filter(i => i.severity === 'minor').length;
  const suggestion = issues.filter(i => i.severity === 'suggestion').length;

  const parts = [];
  if (critical) parts.push(`${critical} critical`);
  if (major) parts.push(`${major} major`);
  if (minor) parts.push(`${minor} minor`);
  if (suggestion) parts.push(`${suggestion} suggestions`);

  return parts.length > 0 ? parts.join(', ') : 'No issues found';
}