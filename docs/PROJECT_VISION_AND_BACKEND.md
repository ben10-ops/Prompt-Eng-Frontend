# Prompt Wars: What We Are Building

## What You Are Doing Right Now

You are building a live event AI experience called Prompt Wars where:

- A target image is shown on a large dashboard screen.
- Participants scan a QR code and open the prompt page on their own phones.
- Each participant writes a prompt to recreate the target image.
- AI generates an image from the participant prompt.
- The system compares generated image vs target image and gives a score.
- Dashboard shows the latest generated outputs and leaderboard rankings.

## What You Want to Achieve

You want this activation to feel premium, intelligent, and stable for real events:

- Real image-based comparison (not only text-based scoring).
- Strong prompt-to-image generation quality.
- Fast, clear leaderboard updates on the main display.
- Mobile-first participation using QR scan.
- A system that does NOT lose leaderboard data on page refresh or temporary network issues.

## Backend Requirement Implemented

To prevent leaderboard reset, backend persistence has been added.

### What changed

- Store data now persists to disk in a JSON backend file.
- Data is loaded automatically on server startup.
- Every new submission is saved immediately.
- Challenge rotation state is saved immediately.

### Persistence file

- `.data/promptwars-store.json`

### Why this solves your issue

- Browser reload no longer clears leaderboard.
- Temporary network interruptions do not delete previous entries.
- Server restarts still recover last saved leaderboard state.

## Current Scoring Summary

Final score is weighted as:

- Similarity: 50%
- Prompt Quality: 20%
- Style Alignment: 20%
- Detail Coverage: 10%

Similarity now uses image comparison pipeline with fallback behavior for reliability.

## Next Production Steps

- Move JSON backend to Postgres for multi-instance deployment.
- Add admin controls (reset leaderboard, start new round, lock timer).
- Add auth for organizer/admin routes.
- Add observability/logging for generation and comparison failures.
