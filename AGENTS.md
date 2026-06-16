# AGENTS.md

Guidance for AI agents and developers working in this repository.

## What this repo is

`PatternYard-Home` — the PatternYard home/landing **frontend**.

- **Framework:** SvelteKit 2 + Svelte 5 (runes) + Vite 6
- **Adapter:** `@sveltejs/adapter-vercel` (deploys to Vercel)
- **Package manager:** npm (`package-lock.json`); `engine-strict` is on
- **Dev server:** `npm run dev` (Vite). v0's preview auto-detects the port.

Routes live in `src/routes`, shared UI/util code in `src/lib`, static assets in `static`.

## The backend (separate repo + deployment)

The API is a separate Express app, **not** part of this repo's build:

- **Source:** `github.com/patternyard/PatternYard-BackendApi`
- **Deployed:** `https://penguinmod-backend.vercel.app`
- **Live production API (default target):** `https://projects.penguinmod.com`

The frontend talks to the backend over **HTTP**, so the two are loosely coupled —
you do not need the backend source to run the frontend.

### Auto-fetching the backend (dev convenience)

`scripts/fetch-backend.mjs` runs on `postinstall` and clones the backend into a
gitignored `.backend/` directory when a dev sandbox provisions. It is:

- **Best-effort & non-fatal** — never blocks `npm install`.
- **Skipped on Vercel/CI/production** (those use the deployed backend).
- **Opt-out** via `SKIP_BACKEND_FETCH=1`.

Run it manually any time with `npm run backend`. Override the source/target with
`BACKEND_REPO` / `BACKEND_DIR` env vars.

## Talking to the backend from the running app

`PUBLIC_API_URL` (see `.env.template`) controls where the app sends API calls:

| Value | Behavior |
| --- | --- |
| `https://projects.penguinmod.com` (default) | Hits the live production API. Reliable, real data. |
| `/api` | Same-origin requests that the Vite dev proxy forwards to the backend. |

### The `/api` dev proxy

`vite.config.js` proxies `/api/*` to `BACKEND_PROXY_TARGET`
(default `https://penguinmod-backend.vercel.app`). Because the proxy runs
server-side, the browser only talks to the dev origin — **no CORS, and cookies
round-trip normally**. To test a locally-running backend instead, set
`BACKEND_PROXY_TARGET=http://localhost:8080` (that backend needs its own
secrets/DB to boot).

So, to exercise **your** backend through the UI:

1. Set `PUBLIC_API_URL=/api` in `.env`.
2. Leave `BACKEND_PROXY_TARGET` at the deployed backend (or point it locally).
3. `npm run dev`.

## Conventions

- Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`) — not legacy stores/reactive `$:`.
- Env vars exposed to the client must be prefixed `PUBLIC_` (SvelteKit rule).
- Do **not** commit `.env` (gitignored); update `.env.template` when adding vars.

## Deploy

Vercel builds this repo with the SvelteKit Vercel adapter. The backend deploys
separately from its own repo. CI workflows are intentionally not tracked here
(the v0 GitHub App cannot push workflow files); rely on Vercel's build.
