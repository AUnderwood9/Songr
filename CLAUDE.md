# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Song Mood Analyzer — an MVP app that analyzes a song's emotional mood using Claude AI and recommends similar songs. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. Currently in early development (scaffold only).

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config with next/core-web-vitals and next/typescript)
- `npm start` — serve production build

## Architecture

- **Next.js App Router** (`app/` directory): Uses the `app/` directory for routing, not `pages/`.
- **Path alias**: `@/*` maps to the project root.
- **Styling**: Tailwind CSS v4 via PostCSS. Dark mode supported via system preference.
- **Fonts**: Geist and Geist Mono loaded via `next/font/google`.
- **TypeScript**: Strict mode enabled, target ES2017, bundler module resolution.

## Target Architecture

See `architecutre.md` for the full target architecture and `epic-evaluation-report.md` for the product roadmap. Key decisions:

- **Deployment**: AWS serverless (Lambda + CloudFront + S3), standalone Next.js output mode
- **AI**: Anthropic Claude API, called only from server-side API routes (`app/api/`), never from client
- **Data**: DynamoDB for mood vocabulary; mood list is locked — AI cannot invent moods outside it
- **PWA**: Offline support, installability, service worker
- **SEO**: SSR for all indexable pages, `generateMetadata` for per-page meta, JSON-LD structured data

## Project Context

Three core user journeys:

1. **Mood Analysis & Discovery** — song input form → Claude API call → mood breakdown display
2. **Song Recommendations** — mood results → Claude API call → recommended song cards (YouTube/Spotify search links, no direct API integration)
3. **First Impressions & Polish** — layout, empty states, loading skeletons, transitions
