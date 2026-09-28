import { Octokit } from '@octokit/rest';
import { Webhooks } from '@octokit/webhooks';

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET || 'build-time-placeholder',
});

export async function getPullRequestDiff(
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
  owner: string,
  repo: string,
  pullNumber: number
) {
  const { data } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });
  return data;
}

export async function createCheckRun(
  owner: string,
  repo: string,
  headSha: string,
  name: string,
  conclusion: 'success' | 'failure' | 'neutral',
  output: { title: string; summary: string; annotations?: any[] }
) {
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

export async function createReviewComment(
  owner: string,
  repo: string,
  pullNumber: number,
  body: string,
  commitId: string,
  path: string,
  line: number
) {
  await octokit.rest.pulls.createReviewComment({
    owner,
    repo,
    pull_number: pullNumber,
    body,
    commit_id: commitId,
    path,
    line,
  });
}