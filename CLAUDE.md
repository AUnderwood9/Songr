# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Song Mood Analyzer — an MVP app that analyzes a song's emotional mood using Claude AI and recommends similar songs. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. Currently in early development (scaffold only).

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config with next/core-web-vitals and next/typescript)
- `npm start` — serve production build
- `npm run test-ui` — run UI tests (Jest + React Testing Library)

## Architecture

- **Next.js App Router** (`app/` directory): Uses the `app/` directory for routing, not `pages/`.
- **Path alias**: `@/*` maps to the project root.
- **Styling**: Tailwind CSS v4 via PostCSS. Dark mode via `html.light` class toggle (dark default, no persistence).
- **Fonts**: Playfair Display, IBM Plex Mono, Geist, Geist Mono loaded via `next/font/google`.
- **TypeScript**: Strict mode enabled, target ES2017, bundler module resolution.

## Folder Structure — Split by Feature

Uses Next.js App Router **split-by-feature** organization (Strategy 3 from the [official docs](https://nextjs.org/docs/app/getting-started/project-structure)). Globally shared code lives at the project root; feature-specific code is colocated with its route using private folders (`_components/`, `_lib/`).

```
song-mood/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── _components/        ← home page components (SongForm, Header)
│   ├── _lib/               ← home page utilities (if needed)
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts
│   ├── results/            ← future: results page
│   │   ├── page.tsx
│   │   ├── _components/    ← results-specific components
│   │   └── _lib/           ← results-specific utilities
│   └── recommendations/    ← future: recommendations page
│       ├── page.tsx
│       └── _components/
├── components/             ← shared components used across multiple routes
├── lib/                    ← shared utilities (moods.ts, validate.ts, anthropic.ts, dynamodb.ts)
├── data/                   ← seed data, fixtures
├── public/
└── [config files]
```

**Rules:**
- Route-specific components go in `_components/` inside that route's folder (private folder, excluded from routing)
- Components used by 2+ routes get promoted to root `components/`
- Shared server utilities (API clients, validation, types) stay in root `lib/`
- When adding a new route, create `_components/` and `_lib/` as needed — don't default to root folders

## Target Architecture

See `architecutre.md` for the full target architecture and `epic-evaluation-report.md` for the product roadmap. Key decisions:

- **Deployment**: AWS serverless (Lambda + CloudFront + S3), standalone Next.js output mode
- **AI**: Anthropic Claude API, called only from server-side API routes (`app/api/`), never from client. Uses **tool use** for structured outputs — the API defines a tool with a JSON schema and forces Claude to return data matching it (`tool_choice: { type: "tool" }`). Shared types (`MoodResult`) are defined in `lib/moods.ts` and used by both the API route and client components.
- **Validation**: Custom lightweight schema validator (`lib/validate.ts`) for API route input. Define a schema object with type/required/min/max constraints, call `validate(input, schema)`, returns `{ success, data }` or `{ success, errors }`. Use this for all new API routes.
- **Data**: DynamoDB for mood vocabulary; mood list is locked — AI cannot invent moods outside it
- **PWA**: Offline support, installability, service worker
- **SEO**: SSR for all indexable pages, `generateMetadata` for per-page meta, JSON-LD structured data

## Project Context

Three core user journeys:

1. **Mood Analysis & Discovery** — song input form → Claude API call → mood breakdown display
2. **Song Recommendations** — mood results → Claude API call → recommended song cards (YouTube/Spotify search links, no direct API integration)
3. **First Impressions & Polish** — layout, empty states, loading skeletons, transitions
