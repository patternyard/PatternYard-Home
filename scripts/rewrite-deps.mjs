#!/usr/bin/env node
/**
 * Stage 2: rewrite a fork's package.json so every git dependency that points at
 * the upstream org (PenguinMod) points at our fork (wycats) AND at our work
 * branch (wycats-main) instead of the upstream-pinned ref.
 *
 * Why the ref must change too: upstream pins refs like #develop / #master. If
 * we only swapped the org we'd pull wycats/<repo>#develop — an unmodified
 * mirror whose OWN package.json still references PenguinMod. The modified
 * manifests live on wycats-main, so the whole graph must point there.
 *
 * The package *names* (scratch-vm, scratch-render, ...) are untouched — only
 * the git source org and ref change. Repo names are kept as written (GitHub
 * owner/repo is case-insensitive, so `penguinmod-render` still resolves).
 *
 * Usage:  node scripts/rewrite-deps.mjs [path-to-repo]   (default: cwd)
 *         node scripts/rewrite-deps.mjs --check [path]    (report only, exit 1 if refs remain)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { UPSTREAM_ORG, FORK_OWNER, WORK_BRANCH, FORK_NAME_BY_UPSTREAM } from './stack-manifest.mjs';

// Rewrite a single dependency specifier. Returns the (possibly) rewritten value.
// Only specifiers that reference the upstream org are touched.
export function rewriteSpecifier(value) {
	if (typeof value !== 'string') return value;
	// Match all git-dep specifier forms npm understands, then <org>/<repo>,
	// optional `.git`, optional `#ref`. `git+https://` is listed before the
	// plain `https://` alternative so the longer prefix wins.
	const re = new RegExp(
		`^(github:|git\\+https://github\\.com/|https://github\\.com/|git\\+ssh://git@github\\.com/|git@github\\.com:)${UPSTREAM_ORG}/([^#./]+)(?:\\.git)?(?:#.+)?$`,
		'i'
	);
	const m = value.match(re);
	if (!m) return value;
	const upstreamRepo = m[2];
	// Translate the upstream repo name to our renamed fork (forks were renamed,
	// e.g. PenguinMod-Vm -> PatternYard-Vm); fall back to identity if unmapped.
	const forkRepo = FORK_NAME_BY_UPSTREAM.get(upstreamRepo.toLowerCase()) || upstreamRepo;
	// Normalize to github: shorthand pinned at our work branch.
	return `github:${FORK_OWNER}/${forkRepo}#${WORK_BRANCH}`;
}

// Recursively rewrite every string value in a (possibly nested) dependency
// block — covers npm `overrides` and yarn `resolutions`, which can nest.
function rewriteBlock(block, path, changes) {
	if (!block || typeof block !== 'object') return;
	for (const key of Object.keys(block)) {
		const val = block[key];
		if (typeof val === 'string') {
			const next = rewriteSpecifier(val);
			if (next !== val) {
				changes.push(`${path}${key}: ${val} -> ${next}`);
				block[key] = next;
			}
		} else if (val && typeof val === 'object') {
			rewriteBlock(val, `${path}${key}.`, changes);
		}
	}
}

// Pure transform over a package.json string. Returns { text, changes, residual }.
export function rewritePackageJson(raw) {
	const pkg = JSON.parse(raw);
	const changes = [];
	for (const field of [
		'dependencies',
		'devDependencies',
		'optionalDependencies',
		'peerDependencies',
		'overrides',
		'resolutions',
	]) {
		rewriteBlock(pkg[field], `${field}.`, changes);
	}
	// Residual count is scoped to dependency-ish fields only; top-level metadata
	// (homepage, repository, bugs) intentionally still points at upstream and is
	// handled separately in the independence pass.
	const depText = JSON.stringify({
		dependencies: pkg.dependencies,
		devDependencies: pkg.devDependencies,
		optionalDependencies: pkg.optionalDependencies,
		peerDependencies: pkg.peerDependencies,
		overrides: pkg.overrides,
		resolutions: pkg.resolutions,
	});
	const residual = (depText.match(new RegExp(`${UPSTREAM_ORG}/`, 'gi')) || []).length;
	const text = JSON.stringify(pkg, null, 2) + (raw.endsWith('\n') ? '\n' : '');
	return { text, changes, residual };
}

// ---- CLI (operate on a local checkout) ----
function main() {
	const args = process.argv.slice(2);
	const checkOnly = args.includes('--check');
	const repoDir = args.find((a) => !a.startsWith('--')) || process.cwd();
	const pkgPath = join(repoDir, 'package.json');

	let raw;
	try {
		raw = readFileSync(pkgPath, 'utf8');
	} catch {
		console.log(`[rewrite] no package.json at ${pkgPath} — skipping`);
		return;
	}

	const { text, changes, residual } = rewritePackageJson(raw);

	if (checkOnly) {
		if (residual) {
			console.log(`[rewrite] ${repoDir}: ${residual} residual ${UPSTREAM_ORG}/ reference(s) remain`);
			process.exit(1);
		}
		console.log(`[rewrite] ${repoDir}: clean (no ${UPSTREAM_ORG}/ references)`);
		return;
	}

	if (!changes.length) {
		console.log(`[rewrite] ${repoDir}: nothing to change`);
		return;
	}

	writeFileSync(pkgPath, text);
	console.log(`[rewrite] ${repoDir}: rewrote ${changes.length} specifier(s):`);
	for (const c of changes) console.log(`  ${c}`);
	if (residual) {
		console.log(`[rewrite] WARNING: ${residual} ${UPSTREAM_ORG}/ reference(s) still present`);
	}
}

// Only run the CLI when invoked directly (not when imported).
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
