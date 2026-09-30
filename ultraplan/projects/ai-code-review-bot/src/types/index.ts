export interface ReviewIssue {
  severity: 'critical' | 'major' | 'minor' | 'suggestion';
  line: number;
  message: string;
  suggestion?: string;
}

export interface ReviewResult {
  summary: string;
  issues: ReviewIssue[];
}

export interface PullRequestPayload {
  action: string;
  pull_request: {
    number: number;
    title: string;
    head: { sha: string };
    base: { ref: string };
  };
  repository: {
    owner: { login: string };
    name: string;
  };
}