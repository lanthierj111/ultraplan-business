import { createSign } from 'crypto';
import { Octokit } from '@octokit/rest';

/**
 * GitHub App authentication.
 *
 * The Checks API refuses user tokens ("You must authenticate via a GitHub App"),
 * so every API call the bot makes on a repository must be authenticated as the
 * app installation, not as a user.
 */

const APP_ID = (process.env.GITHUB_APP_ID || '').trim();

// Vercel stores the PEM with real newlines, but a value pasted through a shell
// can arrive with literal \n sequences. Normalise both shapes.
const PRIVATE_KEY = (process.env.GITHUB_PRIVATE_KEY || '')
  .replace(/\\r\\n/g, '\n')
  .replace(/\\n/g, '\n')
  .trim();

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/** Short-lived JWT that identifies the app itself (max 10 minutes). */
function appJwt(): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({ iat: now - 60, exp: now + 540, iss: APP_ID })
  );
  const signingInput = `${header}.${payload}`;
  const signature = createSign('RSA-SHA256').update(signingInput).sign(PRIVATE_KEY);
  return `${signingInput}.${b64url(signature)}`;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

// Installation tokens live one hour. Module state survives between requests on
// a warm serverless instance, which is exactly when caching pays off.
const tokenCache = new Map<number, CachedToken>();

async function installationToken(installationId: number): Promise<string> {
  const cached = tokenCache.get(installationId);
  if (cached && cached.expiresAt - Date.now() > 60_000) {
    return cached.token;
  }

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${appJwt()}`,
        'User-Agent': 'ai-code-review-bot',
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      `Installation token request failed (${res.status}): ${(await res.text()).slice(0, 300)}`
    );
  }

  const data = (await res.json()) as { token: string; expires_at: string };
  tokenCache.set(installationId, {
    token: data.token,
    expiresAt: new Date(data.expires_at).getTime(),
  });
  return data.token;
}

/** Octokit authenticated as the app's installation, scoped to its repositories. */
export async function octokitForInstallation(installationId: number): Promise<Octokit> {
  if (!APP_ID || !PRIVATE_KEY) {
    throw new Error('GITHUB_APP_ID or GITHUB_PRIVATE_KEY is not configured');
  }
  const token = await installationToken(installationId);
  return new Octokit({ auth: token });
}
