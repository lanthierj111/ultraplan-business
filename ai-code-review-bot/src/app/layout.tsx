import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Code Review — automated review on every pull request',
  description:
    'A GitHub App that reviews every pull request with an AI model and posts inline findings: security flaws, bugs, and maintainability issues — before a human ever looks at the diff.',
  openGraph: {
    title: 'AI Code Review',
    description:
      'Automated pull-request review. Security flaws, bugs and smells, annotated inline on the diff.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
