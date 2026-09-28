import OpenAI from 'openai';

let nemotron: OpenAI | null = null;

function getNemotron(): OpenAI {
  if (!nemotron) {
    nemotron = new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: process.env.NVIDIA_API_KEY || 'build-time-placeholder',
    });
  }
  return nemotron;
}

export const MODEL = 'nvidia/nemotron-3-ultra-550b-a55b';

export async function reviewCode(
  diff: string,
  language: string,
  filename: string
): Promise<{
  summary: string;
  issues: Array<{
    severity: 'critical' | 'major' | 'minor' | 'suggestion';
    line: number;
    message: string;
    suggestion?: string;
  }>;
}> {
  const prompt = buildReviewPrompt(diff, language, filename);

  const completion = await getNemotron().chat.completions.create({
    model: MODEL,
    max_tokens: 4000,
    temperature: 0.1,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from Nemotron');

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse Nemotron response as JSON');
  }
}

const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the provided diff and return a JSON object with:
{
  "summary": "One-paragraph overall assessment",
  "issues": [
    {
      "severity": "critical|major|minor|suggestion",
      "line": <line number in new file>,
      "message": "Clear description of the issue",
      "suggestion": "Optional: concrete fix or improvement"
    }
  ]
}

Severity guidelines:
- critical: Security vulnerability, data loss, crash, auth bypass
- major: Bug, performance problem, maintainability issue
- minor: Style, naming, missing test, doc gap
- suggestion: Improvement, modernization, alternative approach

Focus on: security, correctness, performance, maintainability, testing.
Ignore: whitespace, formatting (handled by linters).`;

function buildReviewPrompt(diff: string, language: string, filename: string): string {
  return `File: ${filename}
Language: ${language}

Diff:
\`\`\`diff
${diff}
\`\`\`

Return JSON review per schema.`;
}