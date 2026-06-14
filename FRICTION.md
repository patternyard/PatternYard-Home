# v0 Friction Log

Notes on rough edges hit while bringing this SvelteKit frontend into a v0 chat
and wiring it to the backend. Kept for later review (the repo owner works on v0).
Each entry: what happened, root cause, and the workaround we used.

## 1. Connecting an existing repo created a NEW repo instead of importing

**What happened:** Connecting this chat to GitHub produced a brand-new repo
`wycats/PenguinMod-HomeNew-9r` (note the `-9r` suffix), seeded from the chat's
*then-current* working tree (a hybrid Next.js/SvelteKit mess), rather than
importing the existing clean `wycats/PenguinMod-HomeNew`.

**Root cause:** The git-connect flow snapshots the current VM tree into a new
repo; it does not offer "adopt this existing repo as source of truth and replace
the working tree with it."

**Workaround:** After connecting, we rebooted the tree from clean upstream by
hand (`git rm` the Next cruft, copy upstream files in, commit) so the connected
repo matched the real frontend.

**Possible fix:** When the target repo name already exists, offer to import it
(replace working tree from repo) instead of silently creating a suffixed repo.

## 2. v0's GitHub App cannot push `.github/workflows/*`

**What happened:** `git push` was rejected after we pulled in upstream's
`.github/workflows/build.yml`.

**Root cause:** The v0 GitHub App's token lacks the `workflows` OAuth scope, so
it cannot create or update workflow files.

**Workaround:** Keep `.github/workflows/*` out of commits made from v0. CI/builds
are handled by Vercel here anyway.

**Possible fix:** Either request the `workflows` scope, or surface a clear,
non-fatal message ("can't push workflow files; skipping") instead of a hard push
rejection that blocks the whole commit.

## 3. In a NON-git chat, terminal (Bash) edits don't persist

**What happened:** A framework conversion done via Bash (`rm -rf app`, `cp -R`)
kept reverting to the Next.js baseline every turn, producing a hybrid tree.

**Root cause (traced in v0 source):** For a non-git chat the per-turn sync
(`syncFilesFromBlock` → additive `writeFiles`, `filterUnchanged:false`)
re-materializes the canonical *block payload* over the VM disk. The block
payload is built only from the agent's **tracked file tools** (Write/Edit/
Delete/Move). Bash writes mutate the disk but never enter the payload, and the
only disk→block capture (`commitManualEdits`) is **git-gated**. So Bash-only
changes are overwritten, while `writeFiles` being additive (never deletes) means
stale files linger → hybrid tree. Framework detection is dependency-based, so a
reverted `package.json` flips the detected framework back.

**Workaround:** Either (a) make file changes through the tracked tools, or
(b) git-back the chat (what we did) so the repo is source of truth and terminal
edits persist.

**Possible fix:** A non-git disk→block reconciliation (diff `CLEAN_CWD` into the
block source), or make the per-turn sync framework-aware so it won't clobber a
`package.json` that has intentionally switched frameworks.

## 4. Vite dev server returns HTTP 403 in the preview ("nothing works")

**What happened:** The SvelteKit/Vite preview rendered nothing. SSR worked when
hit directly on `localhost`, but the v0 preview showed a blocked page.

**Root cause:** Vite 6 enforces `server.allowedHosts` and returns
`403 Blocked request. This host ("…vusercontent.net") is not allowed.` for any
non-localhost Host header. The v0 preview proxies the dev server through a
`*.vusercontent.net` host, so every request was rejected.

**Workaround:** Set `server.allowedHosts` in `vite.config.js` to include
`.vusercontent.net` and `.v0.dev` (and `host: true`). See that file.

**Possible fix:** For Vite/SvelteKit (and any framework with host allowlisting),
v0 could inject its preview host into the dev config automatically, or document
the required `allowedHosts` entry in the Vite starter.

## 5. VM resets between turns; dev server lifecycle

**What happened:** The dev server is not running at the start of a turn; manual
background servers from a previous turn are gone.

**Root cause:** The VM is re-hydrated each turn. v0 manages `npm run dev` itself.

**Workarounds / rules learned:**
- Don't `pkill` the v0-managed dev server or start a competing one on the same
  port — let v0 manage it; it restarts on config changes.
- When you must run a server from Bash, use a foreground command with the
  background flag and **no** `&`/`nohup` (those orphan the process; it gets
  SIGHUP'd and nothing binds the port).
- Push commits to the remote in the same step you make them; local-only commits
  are not durable across turns.

## Bonus: what PenguinMod *forks* use for a server

Relevant because it informs how this frontend should talk to a backend.

Forks like **DinosaurMod** (`dinosaurmod.github.io`, a fork of
`PenguinMod/penguinmod.github.io`) do **not run their own server**. The live site
makes network requests to only two hosts: its own static GitHub Pages assets and
**`projects.penguinmod.com`** — PenguinMod's production backend. They even fork
the backend repo (`Dinosaurmod-BackendApi`) but explicitly mark it "unused."

**Takeaway:** Pointing `PUBLIC_API_URL` at `projects.penguinmod.com` (this repo's
default) is exactly what the cosmetic forks do. Running our own
`penguinmod-backend.vercel.app` (via the `/api` dev proxy) is what makes this a
*real* full-stack fork rather than a reskin.
