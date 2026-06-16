#!/usr/bin/env node
/**
 * Stage 2 (remote): apply the dependency rewrite to each fork's wycats-main
 * branch via the GitHub Contents API — no local clones (the editor/engine
 * repos are large; cloning all of them in the sandbox is wasteful).
 *
 * For each stack repo it: reads package.json @ wycats-main, rewrites
 * github:PenguinMod/X#ref -> github:patternyard/<renamed-fork>#wycats-main, and commits the
 * result back to wycats-main when changed.
 *
 * Token: prefers `gh auth token` (the sandbox's capable, fork/commit-able
 * token); see scripts/fork-stack.mjs for the per-shell token rotation note.
 */
import { spawnSync } from 'node:child_process';
import { TO_FORK, FORK_OWNER, WORK_BRANCH, UPSTREAM_ORG } from './stack-manifest.mjs';
import { rewritePackageJson } from './rewrite-deps.mjs';

function resolveToken() {
	const a = spawnSync('gh', ['auth', 'token'], { encoding: 'utf8' });
	if (a.status === 0 && a.stdout.trim()) return a.stdout.trim();
	return process.env.GH_TOKEN || '';
}
const TOKEN = resolveToken();

function gh(args, { input } = {}) {
	const res = spawnSync('gh', args, {
		encoding: 'utf8',
		input,
		env: { ...process.env, GH_TOKEN: TOKEN },
	});
	return { ok: res.status === 0, out: (res.stdout || '').trim(), err: (res.stderr || '').trim() };
}

const dryRun = process.argv.includes('--dry-run');
const summary = [];

for (const { repo } of TO_FORK) {
	const path = `repos/${FORK_OWNER}/${repo}/contents/package.json?ref=${WORK_BRANCH}`;
	const got = gh(['api', path]);
	if (!got.ok) {
		summary.push(`${repo}: no package.json (${got.err.slice(0, 50)})`);
		continue;
	}
	const meta = JSON.parse(got.out);
	const raw = Buffer.from(meta.content, 'base64').toString('utf8');

	let result;
	try {
		result = rewritePackageJson(raw);
	} catch (e) {
		summary.push(`${repo}: parse error (${e.message.slice(0, 40)})`);
		continue;
	}

	if (!result.changes.length) {
		summary.push(`${repo}: no git-deps to rewrite`);
		continue;
	}

	console.log(`\n[deps] ${repo}: ${result.changes.length} specifier(s)`);
	for (const c of result.changes) console.log(`  ${c}`);
	if (result.residual) {
		console.log(`  WARNING: ${result.residual} ${UPSTREAM_ORG}/ reference(s) still present`);
	}

	if (dryRun) {
		summary.push(`${repo}: ${result.changes.length} change(s) [dry-run]`);
		continue;
	}

	// Commit the rewritten manifest back to wycats-main.
	const body = JSON.stringify({
		message: `Stage 2: repoint git deps ${UPSTREAM_ORG} -> ${FORK_OWNER}#${WORK_BRANCH}`,
		content: Buffer.from(result.text, 'utf8').toString('base64'),
		sha: meta.sha,
		branch: WORK_BRANCH,
	});
	const put = gh(
		['api', '--method', 'PUT', `repos/${FORK_OWNER}/${repo}/contents/package.json`, '--input', '-'],
		{ input: body }
	);
	summary.push(
		put.ok
			? `${repo}: committed ${result.changes.length} change(s)${result.residual ? ' (residual!)' : ''}`
			: `${repo}: COMMIT FAILED — ${put.err.slice(0, 60)}`
	);
}

console.log('\n[deps] summary:');
for (const s of summary) console.log(`  ${s}`);
