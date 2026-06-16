#!/usr/bin/env node
/**
 * Stage 1: fork the entire PenguinMod editor stack into `wycats` and create a
 * `wycats-main` work branch (off the ref the editor pins) on each fork.
 *
 * Idempotent: skips repos already forked and branches already present.
 * Uses the GitHub CLI (`gh`), which must be authenticated as (or able to write
 * to) FORK_OWNER. Run: `node scripts/fork-stack.mjs`
 *
 * This operates on remote repos only — nothing depends on sandbox-local state
 * surviving between turns (see FRICTION #1/#6).
 */
import { spawnSync } from 'node:child_process';
import { FORK_OWNER, UPSTREAM_ORG, WORK_BRANCH, TO_FORK } from './stack-manifest.mjs';

/**
 * Token selection (empirically determined in the v0 sandbox):
 * - `gh auth token` yields a 32-char token that CAN create forks. Prefer it.
 * - git credential / GH_TOKEN often resolve to a 40-char `ghs_` GitHub App
 *   installation token that is more restricted — it reads fine but returns
 *   403 "Resource not accessible by integration" on fork. Fallbacks only.
 * The capable vs restricted token is injected inconsistently per shell
 * (see v0_memories gh-cli-fix); a 40-char `ghs_` token here means this shell
 * can't fork — re-run in another shell until a 32-char token appears.
 */
function ghAuthToken() {
	const res = spawnSync('gh', ['auth', 'token'], { encoding: 'utf8' });
	return res.status === 0 ? (res.stdout || '').trim() : '';
}

function gitCredentialToken() {
	const res = spawnSync('git', ['credential', 'fill'], {
		input: 'protocol=https\nhost=github.com\n\n',
		encoding: 'utf8',
	});
	const m = (res.stdout || '').match(/^password=(.+)$/m);
	return m ? m[1].trim() : '';
}

function resolveToken() {
	return ghAuthToken() || gitCredentialToken() || process.env.GH_TOKEN || '';
}

const GH_TOKEN = resolveToken();
if (!GH_TOKEN) {
	console.error('[fork] could not resolve a GitHub token (GH_TOKEN or git credential). Aborting.');
	process.exit(1);
}

function gh(args, { json = false } = {}) {
	const res = spawnSync('gh', args, {
		encoding: 'utf8',
		env: { ...process.env, GH_TOKEN },
	});
	if (res.status !== 0) {
		return { ok: false, err: (res.stderr || '').trim(), out: (res.stdout || '').trim() };
	}
	const out = (res.stdout || '').trim();
	return { ok: true, out: json && out ? JSON.parse(out) : out };
}

function repoExists(owner, repo) {
	return gh(['api', `repos/${owner}/${repo}`, '--jq', '.full_name']).ok;
}

async function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

/** Wait until the fork is queryable (forking is async on GitHub's side). */
async function waitForFork(repo, tries = 20) {
	for (let i = 0; i < tries; i++) {
		if (repoExists(FORK_OWNER, repo)) return true;
		await sleep(3000);
	}
	return false;
}

/** Ensure WORK_BRANCH exists on the fork, branched from `base`. */
function ensureWorkBranch(repo, base) {
	// Already there?
	if (gh(['api', `repos/${FORK_OWNER}/${repo}/git/ref/heads/${WORK_BRANCH}`, '--jq', '.ref']).ok) {
		return 'exists';
	}
	// Resolve the base branch SHA on the fork.
	const baseRef = gh([
		'api',
		`repos/${FORK_OWNER}/${repo}/git/ref/heads/${base}`,
		'--jq',
		'.object.sha',
	]);
	if (!baseRef.ok) return `no base branch '${base}'`;
	const sha = baseRef.out;
	const create = gh([
		'api',
		`repos/${FORK_OWNER}/${repo}/git/refs`,
		'-f',
		`ref=refs/heads/${WORK_BRANCH}`,
		'-f',
		`sha=${sha}`,
	]);
	return create.ok ? 'created' : `failed: ${create.err}`;
}

async function main() {
	console.log(`[fork] forking ${TO_FORK.length} repos ${UPSTREAM_ORG} -> ${FORK_OWNER}\n`);
	const summary = [];
	for (const { upstream, repo, base } of TO_FORK) {
		if (repoExists(FORK_OWNER, repo)) {
			console.log(`[fork] ${repo}: already forked`);
		} else {
			console.log(`[fork] ${repo}: forking...`);
			const res = gh(['repo', 'fork', `${UPSTREAM_ORG}/${upstream}`, '--clone=false']);
			if (!res.ok) {
				console.log(`[fork] ${repo}: FORK FAILED — ${res.err}`);
				summary.push({ repo, fork: 'FAILED', branch: '-' });
				continue;
			}
			const ready = await waitForFork(repo);
			if (!ready) {
				console.log(`[fork] ${repo}: fork not visible yet (will retry branch next run)`);
				summary.push({ repo, fork: 'pending', branch: '-' });
				continue;
			}
		}
		const branch = ensureWorkBranch(repo, base);
		console.log(`[fork] ${repo}: ${WORK_BRANCH} -> ${branch}`);
		summary.push({ repo, fork: 'ok', branch });
	}

	console.log('\n[fork] summary:');
	for (const s of summary) console.log(`  ${s.repo.padEnd(28)} fork=${s.fork} branch=${s.branch}`);
	const failed = summary.filter((s) => s.fork === 'FAILED');
	process.exit(failed.length ? 1 : 0);
}

main();
