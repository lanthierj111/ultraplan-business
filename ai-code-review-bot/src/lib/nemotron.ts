import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: process.env.NVIDIA_API_KEY || 'not-configured',
    });
  }
  return client;
}

export const MODEL = 'nvidia/nemotron-3-ultra-550b-a55b';

// Vercel Hobby kills a function after 60s. One model call must never consume
// that whole budget, so it gets its own deadline and the caller posts whatever
// it has when the budget runs out.
const PER_CALL_TIMEOUT_MS = 35_000;
const MAX_TOKENS = 1600;

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

export async function reviewCode(
  diff: string,
  language: string,
  filename: string
): Promise<ReviewResult> {
  const completion = await getClient().chat.completions.create(
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.1,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildReviewPrompt(diff, language, filename) },
      ],
      response_format: { type: 'json_object' },
    },
    { timeout: PER_CALL_TIMEOUT_MS }
  );

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from the model');
  return parseReview(content);
}

/**
 * Models routinely wrap JSON in ```json fences despite response_format.
 * Strip fences, then fall back to the outermost {...} span.
 */
function parseReview(content: string): ReviewResult {
  const stripped = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  const candidate = start >= 0 && end > start ? stripped.slice(start, end + 1) : stripped;

  const parsed = JSON.parse(candidate) as Partial<ReviewResult>;
  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
  };
}

const SYSTEM_PROMPT = `You are an expert code reviewer. Analyse the provided diff and return a JSON object:
{
  "summary": "One-paragraph overall assessment",
  "issues": [
    {
      "severity": "critical|major|minor|suggestion",
      "line": <line number in the new file>,
      "message": "Clear description of the issue",
      "suggestion": "Optional: concrete fix"
    }
  ]
}

Severity guidelines:
- critical: security vulnerability, data loss, crash, auth bypass, leaked secret
- major: bug, performance problem, maintainability issue
- minor: style, naming, missing test, doc gap
- suggestion: improvement or alternative approach

Focus on: security, correctness, performance, maintainability, testing.
Ignore: whitespace and formatting (handled by linters).
Report only real problems. Do not invent issues.`;

function buildReviewPrompt(diff: string, language: string, filename: string): string {
  return `File: ${filename}
Language: ${language}

Diff:
\`\`\`diff
${diff}
\`\`\`

Return the JSON review.`;
}
