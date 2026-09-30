import type { Octokit } from '@octokit/rest';

/**
 * GitHub API helpers. Every function receives an installation-authenticated
 * Octokit (see app-auth.ts) because the Checks API rejects user tokens.
 */

export async function getPullRequestDiff(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string> {
  const { data } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
    mediaType: { format: 'diff' },
  });
  return data as unknown as string;
}

export async function getPullRequestFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number
) {
  const { data } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });
  return data;
}

export interface CheckAnnotation {
  path: string;
  start_line: number;
  end_line: number;
  annotation_level: 'notice' | 'warning' | 'failure';
  message: string;
}

export async function createCheckRun(
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
  name: string,
  conclusion: 'success' | 'failure' | 'neutral',
  output: { title: string; summary: string; annotations?: CheckAnnotation[] }
): Promise<void> {
  await octokit.rest.checks.create({
    owner,
    repo,
    name,
    head_sha: headSha,
    status: 'completed',
    conclusion,
    output,
  });
}
