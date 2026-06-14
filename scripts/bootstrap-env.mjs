/**
 * Ensure a local .env exists so SvelteKit's $env/static/public vars
 * (PUBLIC_API_URL, PUBLIC_STUDIO_URL, ...) resolve during dev.
 *
 * Why this exists: .env is gitignored (correct — it can hold local
 * overrides) and the v0 sandbox is re-provisioned between turns, which
 * wipes it. Without it, PUBLIC_STUDIO_URL renders as the literal string
 * "undefined" and every Studio/editor link breaks.
 *
 * IMPORTANT: the v0-managed dev server launches `node_modules/.bin/vite dev`
 * directly (not `npm run dev`), so npm lifecycle hooks like postinstall/predev
 * do NOT fire on provision. The reliable place to call ensureEnv() is
 * vite.config.js, which Vite loads on every dev start. This module is also
 * runnable directly (node scripts/bootstrap-env.mjs) for manual use.
 *
 * Safe by design: it never overwrites an existing .env, so any local
 * customization (e.g. PUBLIC_API_URL=/api to route through the dev proxy)
 * is preserved.
 */
import { existsSync, copyFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Create .env from .env.template if it is missing. Returns true if a file was
 * created, false otherwise. Never throws — env bootstrapping must not break the
 * dev server startup.
 * @param {string} [root] project root (defaults to the repo root)
 */
export function ensureEnv(root = join(dirname(fileURLToPath(import.meta.url)), '..')) {
	try {
		// Skip in production / CI / Vercel build — there, PUBLIC_* values come from
		// the platform's environment settings; writing .env could shadow them.
		if (process.env.VERCEL || process.env.CI || process.env.NODE_ENV === 'production') {
			return false;
		}

		const envPath = join(root, '.env');
		const templatePath = join(root, '.env.template');

		if (existsSync(envPath)) return false;
		if (!existsSync(templatePath)) {
			console.warn('[bootstrap-env] no .env.template found — skipping.');
			return false;
		}

		copyFileSync(templatePath, envPath);
		const lines = readFileSync(envPath, 'utf8')
			.split('\n')
			.filter((l) => l.trim() && !l.trim().startsWith('#')).length;
		console.log(`[bootstrap-env] created .env from .env.template (${lines} vars).`);
		return true;
	} catch (err) {
		console.warn('[bootstrap-env] failed (non-fatal):', err?.message ?? err);
		return false;
	}
}

// Allow running directly: `node scripts/bootstrap-env.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
	const created = ensureEnv();
	if (!created) console.log('[bootstrap-env] nothing to do (.env present or skipped).');
}
