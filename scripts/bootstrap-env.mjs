#!/usr/bin/env node
/**
 * Ensure a local .env exists so SvelteKit's $env/static/public vars
 * (PUBLIC_API_URL, PUBLIC_STUDIO_URL, ...) resolve during dev.
 *
 * Why this exists: .env is gitignored (correct — it can hold local
 * overrides) and the v0 sandbox is re-provisioned between turns, which
 * wipes it. Without it, PUBLIC_STUDIO_URL renders as the literal string
 * "undefined" and every Studio/editor link breaks. This script recreates
 * .env from .env.template on provision (via the postinstall hook) so the
 * frontend always has its required public vars.
 *
 * Safe by design: it never overwrites an existing .env, so any local
 * customization (e.g. PUBLIC_API_URL=/api to route through the dev proxy)
 * is preserved.
 */
import { existsSync, copyFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Skip in production / CI / Vercel build — there, PUBLIC_* values come from
// the platform's environment settings; writing .env from the template could
// shadow them with defaults.
if (process.env.VERCEL || process.env.CI || process.env.NODE_ENV === 'production') {
	console.log('[bootstrap-env] skipped (CI/production environment)');
	process.exit(0);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');
const templatePath = join(root, '.env.template');

if (existsSync(envPath)) {
	console.log('[bootstrap-env] .env already exists — leaving it untouched.');
	process.exit(0);
}

if (!existsSync(templatePath)) {
	console.warn('[bootstrap-env] no .env.template found — skipping.');
	process.exit(0);
}

copyFileSync(templatePath, envPath);
const lines = readFileSync(envPath, 'utf8')
	.split('\n')
	.filter((l) => l.trim() && !l.trim().startsWith('#')).length;
console.log(`[bootstrap-env] created .env from .env.template (${lines} vars). Edit it to set PUBLIC_API_URL=/api for proxy mode.`);
