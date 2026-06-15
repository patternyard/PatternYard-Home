# Self-Hosting the PenguinMod Stack

This fork runs a fully self-hosted PenguinMod stack: the Home frontend, the
editor, the project packager, and the backend API are all forks under the
`wycats` GitHub account, deployed to our own Vercel projects, and wired to talk
to **each other** rather than to upstream `*.penguinmod.com`.

This document is the map of what runs where, how it is wired, and the audit that
confirms the editor depends only on our backend.

## Components

| Component   | Repo (branch)                              | Vercel project        | Live URL                                |
| ----------- | ------------------------------------------ | --------------------- | --------------------------------------- |
| Home        | `wycats/PenguinMod-HomeNew-9r` (this repo) | `penguinmod-frontend` | (preview / prod alias)                  |
| Editor      | `wycats/penguinmod.github.io` (`wycats-main`) | `penguinmod-studio`   | `https://penguinmod-studio.vercel.app`  |
| Packager    | `wycats/PenguinMod-Packager` (`wycats-main`)  | `penguinmod-packager` | `https://penguinmod-packager.vercel.app`|
| Backend API | `wycats/PenguinMod-BackendApi`             | `penguinmod-backend`  | `https://penguinmod-backend.vercel.app` |

The editor pulls 11 engine/UI sub-packages (scratch-vm, scratch-render, etc.)
from git; those are also forked under `wycats` with `wycats-main` branches. See
`scripts/stack-manifest.mjs` for the authoritative list and
`scripts/fork-stack.mjs` / `scripts/rewrite-deps.mjs` for the tooling that
created and rewired them.

## How the pieces are wired

### Home -> editor / packager

Home builds every editor-family link from a single env var,
`PUBLIC_STUDIO_URL`, in `src/lib/resources/external-links.js`
(`editor.html`, `credits.html`, `contact.html`, `PenguinMod-Packager/`).

- **Production:** set as a Vercel env var on the `penguinmod-frontend` project.
- **Dev / default:** committed in `.env.template` (copied to `.env` by
  `scripts/bootstrap-env.mjs`).
- Current value: `https://penguinmod-studio.vercel.app`. Set it back to
  `https://studio.penguinmod.com` to use upstream.

### Editor -> backend

The editor's service origins are centralized in `src/lib/pm-config.js`
(in the editor repo), read from build-time env vars inlined by webpack's
`DefinePlugin`:

- `PM_API_ROOT` -> `https://penguinmod-backend.vercel.app` (our backend)
- `PM_EXTENSIONS_ROOT`, `PM_LIBRARY_ROOT`, `PM_ASSET_CDN_ROOT`, `PM_DOCS_ROOT`
  -> still default to upstream PenguinMod (content/CDN services with no clean
  fork; configurable here for a future self-host stage).

`PM_API_ROOT` is set as a Vercel env var on the `penguinmod-studio` project.
**Each value must reference `process.env.PM_*` directly** — aliasing defeats
DefinePlugin's textual replacement.

### Editor -> packager (proxy)

Home links to `${PUBLIC_STUDIO_URL}/PenguinMod-Packager/`, but the packager is a
separate deployment. The editor repo's `vercel.json` rewrites
`/PenguinMod-Packager/*` to the `penguinmod-packager` deployment. The packager
uses relative asset paths, so it works under the prefix. Three rewrite rules are
needed (bare, trailing-slash, and `:path+` for sub-assets).

## Backend independence audit

The editor talks to `PM_API_ROOT` for exactly these endpoints (all under
`/api/v1/`):

| Endpoint                       | Used by                          | Live status on our backend            |
| ------------------------------ | -------------------------------- | ------------------------------------- |
| `projects/getProject` (protobuf) | project load (`project-fetcher-hoc`) | 503 `Viewing is disabled` (see below) |
| `projects/getproject` (metadata/thumbnail) | project meta (`tw-project-meta-fetcher-hoc`) | 503 `Viewing is disabled`             |
| `projects/getremixes`          | remix list                       | 200                                   |
| `projects/canuploadprojects`   | share button                     | 200                                   |
| `projects/backupassetget`      | asset restore (`storage.js`)     | 503 `Viewing is disabled`             |
| `users/getpfp`                 | credits / studio view            | 404 `NotFound` (empty user DB)        |

**All six endpoints are served by our own backend fork** (DB-connected), with
zero fallback to upstream. The non-200 responses are correct
application-level states on a fresh deployment, not missing routes or crashes:

- **503 `Viewing is disabled`** is gated by a `viewingEnabled` runtime-config
  flag stored in the backend DB (`api/v1/db/UserManager.js`, defaults off). Flip
  that DB flag to enable project loading/asset restore.
- **404 `NotFound`** from `getpfp` means the queried user does not exist in our
  (fresh) user DB — the route ran and queried correctly.

Note: the editor's storage layer only **reads** projects/assets (all
create/update configs are `die`). Saving/publishing is driven by Home, not the
editor, so the editor's backend surface is read-only.

## Building / deploying

All four Vercel projects use Git integration (push to `wycats-main` ->
auto-build). The editor and packager are webpack-4 projects that build with:

- Node `22.x`, `installCommand`:
  `npm i -g pnpm@8 && pnpm install --no-frozen-lockfile --shamefully-hoist`
- `NODE_OPTIONS=--openssl-legacy-provider` (webpack 4 MD4 hashing on OpenSSL 3)
- Output dir: `build/` (editor) / `dist/` (packager)

`--no-frozen-lockfile` is required because the dependency graph was rewritten to
`wycats#wycats-main` but the committed lockfiles still pin the old refs.
