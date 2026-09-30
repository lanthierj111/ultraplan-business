# Ultraplan — Autonomous Business Flywheel

## Structure
\\\
ultraplan/
├── loops/              # Chaque boucle = un cycle DISCOVER→BUILD→DEPLOY→GROW→MONETIZE→REINVEST
│   └── loop-1/         # AI Code Review Bot (en cours)
├── projects/           # Projets déployés (repos GitHub)
│   └── ai-code-review-bot/
├── shared/             # Composants réutilisables
├── docs/               # Documentation
├── config/             # Configs Hermes, .env, etc.
└── scripts/            # Scripts d'automatisation
\\\

## Modèles actifs (Hermes)
- **Primaire** : DeepSeek v4.1 Flash (OpenRouter)
- **Fallbacks** : OpenRouter (Claude, Gemini) → NVIDIA (Nemotron, GLM, GPT-OSS)

## Clés actives
- OPENROUTER_API_KEY (DeepSeek v4.1 Flash primaire)
- NVIDIA_API_KEY (fallback chain)
- GITHUB_TOKEN (GitHub App + MCP)
- VERCEL_TOKEN (déploiement)

## Projet actif : Loop 1 - AI Code Review Bot
- Repo: https://github.com/lanthierj111/ai-code-review-bot
- Deploy: https://ai-code-review-bot-five.vercel.app
- Prochaine étape: GitHub App + test PR review
