export interface ReviewRules {
  /** Max files to review in one PR */
  max_files?: number;
  /** Max diff characters per file */
  max_diff_chars?: number;
  /** File extensions to review (e.g., ['.ts', '.js', '.py']) */
  extensions?: string[];
  /** Glob patterns to ignore */
  ignore?: string[];
}

export async function loadRules(
  octokit: any,
  owner: string,
  repo: string,
  headSha: string
): Promise<ReviewRules> {
  try {
    // Try to fetch .ai-review.yml from the repo at the PR head
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: '.ai-review.yml',
      ref: 'HEAD',
    });

    if (!('content' in data)) {
      return getDefaultRules();
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return parseRulesYaml(content);
  } catch {
    return getDefaultRules();
  }
}

function getDefaultRules(): ReviewRules {
  return {
    max_files: 3,
    max_diff_chars: 12000,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.cs', '.php', '.rb'],
    ignore: ['**/*.d.ts', '**/*.min.js', '**/node_modules/**', '**/dist/**', '**/build/**'],
  };
}

function parseRulesYaml(content: string): ReviewRules {
  // Simple YAML parser for our limited schema
  const rules: ReviewRules = getDefaultRules();

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...rest] = trimmed.split(':');
    const value = rest.join(':').trim();

    switch (key.trim()) {
      case 'max_files':
        rules.max_files = parseInt(value, 10) || 3;
        break;
      case 'max_diff_chars':
        rules.max_diff_chars = parseInt(value, 10) || 12000;
        break;
      case 'extensions':
        if (value.startsWith('[') && value.endsWith(']')) {
          rules.extensions = value
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/['"]/g, ''))
            .filter(Boolean);
        }
        break;
      case 'ignore':
        if (value.startsWith('[') && value.endsWith(']')) {
          rules.ignore = value
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/['"]/g, ''))
            .filter(Boolean);
        }
        break;
    }
  }

  return rules;
}