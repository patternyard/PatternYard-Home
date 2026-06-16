#!/usr/bin/env node
/**
 * Best-effort fetch of the PenguinMod backend API repo into a local,
 * gitignored `.backend/` directory so the full stack is available when a
 * dev sandbox provisions.
 *
 * - Runs automatically via the `postinstall` npm hook.
 * - Skipped on Vercel / CI / production builds (the deployed backend is used
 *   there, not a local clone).
 * - Non-fatal: if git or auth is unavailable it prints a hint and exits 0 so
 *   it never blocks `npm install`.
 *
 * The frontend talks to the backend over HTTP (via the Vite `/api` dev proxy,
 * see vite.config.js), so this clone is purely a developer convenience for
 * reading/running the backend locally — it is not required to run the frontend.
 */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const BACKEND_REPO = process.env.BACKEND_REPO || 'patternyard/PatternYard-BackendApi';
const TARGET_DIR = process.env.BACKEND_DIR || '.backend';

// Skip in production / CI / Vercel build — those use the deployed backend.
if (process.env.VERCEL || process.env.CI || process.env.NODE_ENV === 'production') {
	console.log('[v0] fetch-backend: skipped (CI/production environment)');
	process.exit(0);
}

// Allow opting out entirely.
if (process.env.SKIP_BACKEND_FETCH) {
	console.log('[v0] fetch-backend: skipped (SKIP_BACKEND_FETCH set)');
	process.exit(0);
}

function has(cmd) {
	const probe = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
	return !probe.error && probe.status === 0;
}

function run(cmd, args, opts = {}) {
	return spawnSync(cmd, args, { stdio: 'inherit', ...opts });
}

try {
	const targetPath = join(process.cwd(), TARGET_DIR);

	if (existsSync(join(targetPath, '.git'))) {
		console.log(`[v0] fetch-backend: updating existing ${TARGET_DIR}/ ...`);
		run('git', ['-C', targetPath, 'pull', '--ff-only', '--quiet']);
		console.log('[v0] fetch-backend: backend up to date.');
		process.exit(0);
	}

	// Prefer the GitHub CLI (pre-authenticated in many sandboxes); fall back to
	// a plain https git clone.
	if (has('gh')) {
		console.log(`[v0] fetch-backend: cloning ${BACKEND_REPO} via gh into ${TARGET_DIR}/ ...`);
		const res = run('gh', ['repo', 'clone', BACKEND_REPO, TARGET_DIR, '--', '--depth', '1']);
		if (res.status === 0) {
			console.log('[v0] fetch-backend: done.');
			process.exit(0);
		}
	}

	if (has('git')) {
		console.log(`[v0] fetch-backend: cloning ${BACKEND_REPO} via git into ${TARGET_DIR}/ ...`);
		const url = `https://github.com/${BACKEND_REPO}.git`;
		const res = run('git', ['clone', '--depth', '1', url, TARGET_DIR]);
		if (res.status === 0) {
			console.log('[v0] fetch-backend: done.');
			process.exit(0);
		}
	}

	console.log(
		`[v0] fetch-backend: could not clone ${BACKEND_REPO} (no auth or network). ` +
			`This is optional — the frontend uses the deployed backend over the /api proxy. ` +
			`To fetch it manually: gh repo clone ${BACKEND_REPO} ${TARGET_DIR}`
	);
	process.exit(0);
} catch (err) {
	console.log(`[v0] fetch-backend: skipped due to error: ${err?.message ?? err}`);
	process.exit(0);
}
