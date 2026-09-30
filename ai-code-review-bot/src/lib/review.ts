import { getPullRequestDiff, getPullRequestFiles, createCheckRun } from './github';
import { reviewCode, type ReviewIssue } from './nemotron';
import { octokitForInstallation } from './app-auth';

// Vercel Hobby caps a function at 60s. Keep the whole review comfortably inside
// that: bounded file count, bounded prompt size, and a wall-clock budget.
const MAX_FILES = 3;
const MAX_DIFF_CHARS = 12_000;
const BUDGET_MS = 45_000;

interface CollectedIssue extends ReviewIssue {
  path: string;
}

export async function handlePullRequest(payload: any): Promise<void> {
  const startedAt = Date.now();
  const { pull_request, repository, installation } = payload;
  const { number, head, title } = pull_request;
  // The webhook payload exposes repository.name (not repository.repo).
  const { owner, name: repoName } = repository;
  const headSha = head.sha;
  const octokit = await octokitForInstallation(installation.id);

  console.log(`Reviewing PR #${number}: ${title} (${owner.login}/${repoName})`);

  const [files, diff] = await Promise.all([
    getPullRequestFiles(octokit, owner.login, repoName, number),
    getPullRequestDiff(octokit, owner.login, repoName, number),
  ]);

  const targets = files
    .filter((f) => shouldReviewFile(f.filename) && f.status !== 'removed')
    .slice(0, MAX_FILES);

  console.log(
    `Files: ${files.length} changed, reviewing ${targets.length}` +
      ` (${files.length - targets.length} skipped/over cap)`
  );

  // Review in parallel: wall-clock time stays near one model call instead of N.
  const results = await Promise.all(
    targets.map(async (file): Promise<CollectedIssue[]> => {
      if (Date.now() - startedAt > BUDGET_MS) {
        console.warn(`Budget exhausted, skipping ${file.filename}`);
        return [];
      }
      try {
        const fileDiff = extractFileDiff(diff, file.filename);
        if (!fileDiff) return [];

        const prompt = fileDiff.length > MAX_DIFF_CHARS
          ? `${fileDiff.slice(0, MAX_DIFF_CHARS)}\n... (diff truncated)`
          : fileDiff;

        const result = await reviewCode(prompt, detectLanguage(file.filename), file.filename);
        return result.issues.map((issue) => ({ ...issue, path: file.filename }));
      } catch (err) {
        console.error(`Failed to review ${file.filename}:`, err);
        return [];
      }
    })
  );

  const allIssues = results.flat();
  const conclusion = allIssues.some((i) => i.severity === 'critical' || i.severity === 'major')
    ? ('failure' as const)
    : ('success' as const);

  const output = {
    title: `AI Code Review: ${allIssues.length} issue(s) found`,
    summary: buildSummary(allIssues, targets.length, files.length, Date.now() - startedAt),
    // GitHub rejects the entire check run if any annotation falls outside the
    // diff (422). Cap the list and keep a summary-only retry as a safety net.
    annotations: allIssues.slice(0, 50).map((i) => ({
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
  return reviewedExtensions.some((ext) => filename.endsWith(ext));
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
  const fileLines: string[] = [];

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
    case 'critical':
    case 'major':
      return 'failure';
    case 'minor':
      return 'warning';
    default:
      return 'notice';
  }
}

function buildSummary(issues: CollectedIssue[], reviewed: number, changed: number, elapsedMs: number): string {
  const count = (sev: string) => issues.filter((i) => i.severity === sev).length;
  const parts: string[] = [];
  if (count('critical')) parts.push(`${count('critical')} critical`);
  if (count('major')) parts.push(`${count('major')} major`);
  if (count('minor')) parts.push(`${count('minor')} minor`);
  if (count('suggestion')) parts.push(`${count('suggestion')} suggestions`);

  const found = parts.length > 0 ? parts.join(', ') : 'No issues found';
  return `${found}. Reviewed ${reviewed} of ${changed} changed file(s) in ${Math.round(elapsedMs / 1000)}s.`;
}
