# BIAS CCR Files — Quartz site

This repo publishes the **player-facing BIAS CCR files** (a Traveller campaign wiki, Solo Sector Subsector J) to GitHub Pages at `https://bartlebythecoder.github.io/bias_ccr_bot/`. Players browse it directly and question it through the **BIAS CCR Bot**, an in-game chat widget backed by Claude.

**This repo is public.** Anything committed here, including this file, can be read by players.

## Rules

- **`content/` is a one-way mirror. Do not edit it here.** `run_sync.bat` copies the source wiki over `content/` with `robocopy /MIR` and then runs `npx quartz sync`. Edits made here are overwritten on the next sync, and new files are deleted. Content changes belong in the source wiki (see `CLAUDE.local.md` if present).
- **Never put notes, drafts or instructions in `content/`.** Everything there is published to players.
- **Everything in `content/` is player-facing.** Write only what the players' characters know.

## Bot code in this repo

The bot lives mainly in the sibling repo `../quartz-wiki-proxy` (Netlify Function). Two parts of it live here and follow its manifest:

- `quartz/static/ask-ai.js` — the chat widget. Player-visible strings follow the Bot voice rules (never say "wiki", "notes" or "pages").
- `quartz/components/Head.tsx` — the site-wide `noindex, nofollow` meta tag. Don't remove it.

The bot reads the published `static/contentIndex.json`, so syncing this site updates the bot automatically.

## Bot project manifest

@../quartz-wiki-proxy/PROJECT_MANIFEST.md
