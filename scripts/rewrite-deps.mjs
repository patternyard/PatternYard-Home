#!/usr/bin/env node
/**
 * Stage 2: rewrite a fork's package.json so every git dependency that points at
 * the upstream org (PenguinMod) points at our fork owner (wycats) instead. The
 * package *names* (scratch-vm, scratch-render, ...) are untouched — only the
 * git source org changes. The pinned `#<ref>` is preserved.
 *
 * Usage:  node scripts/rewrite-deps.mjs [path-to-repo]   (default: cwd)
 *         node scripts/rewrite-deps.mjs --check [path]    (report only, exit 1 if refs remain)
 *
 * Handles both specifier styles:
 *   github:PenguinMod/Repo#ref
 *   git+https://github.com/PenguinMod/Repo(.git)(#ref)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { UPSTREAM_ORG, FORK_OWNER } from './stack-manifest.mjs';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const repoDir = args.find((a) => !a.startsWith('--')) || process.cwd();
const pkgPath = join(repoDir, 'package.json');

// Match the org inside the common git-dep specifier forms, case-sensitive on
// the org segment so we only touch PenguinMod-owned references.
const ghShort = new RegExp(`(github:)${UPSTREAM_ORG}(/)`, 'g');
const ghUrl = new RegExp(`(github\\.com/)${UPSTREAM_ORG}(/)`, 'g');

function rewriteSpecifier(value) {
	if (typeof value !== 'string') return value;
	return value.replace(ghShort, `$1${FORK_OWNER}$2`).replace(ghUrl, `$1${FORK_OWNER}$2`);
}

function rewriteDepBlock(block, changes) {
	if (!block) return;
	for (const name of Object.keys(block)) {
		const next = rewriteSpecifier(block[name]);
		if (next !== block[name]) {
			changes.push(`${name}: ${block[name]} -> ${next}`);
			block[name] = next;
		}
	}
}

let raw;
try {
	raw = readFileSync(pkgPath, 'utf8');
} catch {
	console.log(`[rewrite] no package.json at ${pkgPath} — skipping`);
	process.exit(0);
}

const pkg = JSON.parse(raw);
const changes = [];
for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
	rewriteDepBlock(pkg[field], changes);
}

// Detect any residual upstream references anywhere in the manifest text.
const residual = JSON.stringify(pkg).match(new RegExp(`${UPSTREAM_ORG}/`, 'g')) || [];

if (checkOnly) {
	if (residual.length) {
		console.log(`[rewrite] ${repoDir}: ${residual.length} residual ${UPSTREAM_ORG}/ reference(s) remain`);
		process.exit(1);
	}
	console.log(`[rewrite] ${repoDir}: clean (no ${UPSTREAM_ORG}/ references)`);
	process.exit(0);
}

if (!changes.length) {
	console.log(`[rewrite] ${repoDir}: nothing to change`);
	process.exit(0);
}

// Preserve trailing newline style.
const out = JSON.stringify(pkg, null, 2) + (raw.endsWith('\n') ? '\n' : '');
writeFileSync(pkgPath, out);
console.log(`[rewrite] ${repoDir}: rewrote ${changes.length} specifier(s):`);
for (const c of changes) console.log(`  ${c}`);
if (residual.length) {
	console.log(`[rewrite] WARNING: ${residual.length} ${UPSTREAM_ORG}/ reference(s) still present after rewrite`);
}
