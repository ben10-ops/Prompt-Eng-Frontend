# Prompt Wars MVP

Corporate event activation app where teams compete to recreate a target image using prompts.

## What Is Implemented

- Main attract screen with:
	- Target image
	- Live leaderboard
	- Join QR code
	- Latest result QR code
- Mobile participant flow:
	- Player name + prompt submission with 60-second player timer
	- Mandatory post-submit survey before result reveal
	- Validation and submission feedback
- Live scoring model:
	- Similarity
	- Prompt quality
	- Style alignment
	- Detail coverage
	- Final weighted score
- AI persona assignment:
	- Tier + style tag + character + prompt DNA insight
- Result claim page:
	- Original vs generated comparison
	- Full score breakdown
	- Persona reveal

## Routes

- `/` home and navigation
- `/screen` main event display
- `/join` participant mobile form
- `/result/[id]` team result and identity card
- `/survey/[id]` post-submit feedback survey gate
- `/api/submit` submit prompt and generate scored result
- `/api/survey` finalize submission after feedback and persist survey data
- `/api/state` fetch current challenge and leaderboard

## Run

```bash
npm install
npm run dev
```

Production app: https://prompt-war-six.vercel.app/screen
Backend API: https://prompt-eng-backend.onrender.com

## Deployment Env Variables

Set these in Vercel (Frontend project):

- `NEXT_PUBLIC_BACKEND_URL=https://prompt-eng-backend.onrender.com`
- `BACKEND_URL=https://prompt-eng-backend.onrender.com`
- `NEXT_PUBLIC_APP_URL=https://prompt-war-six.vercel.app`

## Notes

- Leaderboard/session data is persisted to `.data/promptwars-store.json`.
- Data survives page reloads and temporary network interruptions.
- Survey responses are saved to `.data/promptwars-feedback.csv` with player stats.
- Image generation is mocked with deterministic seeded images for demo speed.

## Production Upgrade Path

- Replace in-memory store with Postgres
- Add queue worker for real image generation APIs
- Add authentication/admin controls for round management
- Move QR generation and scoring into durable backend services
