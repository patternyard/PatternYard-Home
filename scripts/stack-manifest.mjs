/**
 * Single source of truth for the PenguinMod -> wycats full-stack fork.
 *
 * Every repo here is forked 1:1 into the `wycats` account. The editor app
 * pulls each engine as a git dependency pinned to a branch; the package
 * *names* (scratch-vm, scratch-render, ...) are unchanged — only the source
 * org changes (PenguinMod -> wycats). See v0_plans/pragmatic-scheme.md.
 */

export const UPSTREAM_ORG = 'PenguinMod';
export const FORK_OWNER = 'wycats';

/**
 * The branch we carry our changes on, per repo, so upstream stays mergeable.
 * `base` is the upstream branch the editor pins / that we branch from.
 */
export const WORK_BRANCH = 'wycats-main';

/**
 * The full stack. `base` is the upstream ref the editor depends on (and the
 * branch we fork our work branch from). Repos already forked are flagged.
 */
export const STACK = [
	// Editor application (studio.penguinmod.com) — scratch-gui fork, webpack build.
	{ repo: 'penguinmod.github.io', role: 'editor', base: 'develop' },

	// Engines (libraries consumed by the editor). `base` is the exact ref the
	// editor pins as a git dependency (verified against the combiner manifest).
	{ repo: 'PenguinMod-Vm', role: 'engine', base: 'develop' },
	{ repo: 'PenguinMod-Blocks', role: 'engine', base: 'develop-builds' },
	{ repo: 'PenguinMod-Render', role: 'engine', base: 'develop' },
	{ repo: 'PenguinMod-Audio', role: 'engine', base: 'develop' },
	{ repo: 'PenguinMod-Paint', role: 'engine', base: 'develop' },
	{ repo: 'PenguinMod-Storage', role: 'engine', base: 'develop' },
	{ repo: 'PenguinMod-Parser', role: 'engine', base: 'master' },
	{ repo: 'penguinmod-render-fonts', role: 'engine', base: 'master' },
	{ repo: 'penguinmod-svg-renderer', role: 'engine', base: 'develop' },

	// Content / docs rendering used by the editor.
	{ repo: 'PenguinMod-MarkDown', role: 'content', base: 'master' },

	// Backend services the editor calls. Forkable + self-hostable.
	{ repo: 'PenguinMod-ExtensionsGallery', role: 'service', base: 'main' },
	{ repo: 'PenguinMod-Docs', role: 'service', base: 'main' },

	// Already forked into wycats.
	{ repo: 'PenguinMod-HomeNew', role: 'home', base: 'main', done: true },
	{ repo: 'PenguinMod-BackendApi', role: 'backend', base: 'main', done: true },
];

/** Repos that still need forking (everything not already done). */
export const TO_FORK = STACK.filter((s) => !s.done);
