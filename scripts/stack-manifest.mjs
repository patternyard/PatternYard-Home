/**
 * Single source of truth for the PenguinMod -> patternyard full-stack fork.
 *
 * Every repo here was forked from the upstream `PenguinMod` org into the
 * `patternyard` org AND renamed (PenguinMod-* / penguinmod-* -> PatternYard-*).
 * The editor app pulls each engine as a git dependency pinned to our work
 * branch; the package *names* (scratch-vm, scratch-render, ...) are unchanged —
 * only the source org + repo name + ref change. See the migration plan doc.
 *
 * IMPORTANT: because the forks were renamed, every entry carries BOTH names:
 *   - `upstream`: the repo name under UPSTREAM_ORG  (fork source + dep matching)
 *   - `repo`:     the repo name under FORK_OWNER     (our fork; branch + rewrite target)
 * Do not collapse these back into one field — the names genuinely differ now
 * (e.g. penguinmod.github.io -> patternyard-studio).
 */

export const UPSTREAM_ORG = 'PenguinMod';
export const FORK_OWNER = 'patternyard';

/**
 * The branch we carry our changes on, per repo, so upstream stays mergeable.
 * NOTE: the name `wycats-main` is historical (the stack first lived under the
 * `wycats` account before the move to the `patternyard` org). It is still the
 * live, deployed work branch on all forks, so renaming it would mean recreating
 * the branch on ~18 repos, rewriting every git-dep ref, and redeploying — a
 * separate, deferred chore. Keep as-is until that is scheduled.
 */
export const WORK_BRANCH = 'wycats-main';

/**
 * The full stack. `base` is the upstream ref the editor depends on (and the
 * branch we fork our work branch from). `upstream` is the name under
 * UPSTREAM_ORG; `repo` is the renamed fork under FORK_OWNER. Repos already
 * settled (not re-forked) are flagged `done`.
 */
export const STACK = [
	// Editor application (studio.patternyard / studio.penguinmod.com) — scratch-gui fork, webpack build.
	{ upstream: 'penguinmod.github.io', repo: 'patternyard-studio', role: 'editor', base: 'develop' },

	// Engines (libraries consumed by the editor). `base` is the exact ref the
	// editor pins as a git dependency (verified against the combiner manifest).
	{ upstream: 'PenguinMod-Vm', repo: 'PatternYard-Vm', role: 'engine', base: 'develop' },
	{ upstream: 'PenguinMod-Blocks', repo: 'PatternYard-Blocks', role: 'engine', base: 'develop-builds' },
	{ upstream: 'PenguinMod-Render', repo: 'PatternYard-Render', role: 'engine', base: 'develop' },
	{ upstream: 'PenguinMod-Audio', repo: 'PatternYard-Audio', role: 'engine', base: 'develop' },
	{ upstream: 'PenguinMod-Paint', repo: 'PatternYard-Paint', role: 'engine', base: 'develop' },
	{ upstream: 'PenguinMod-Storage', repo: 'PatternYard-Storage', role: 'engine', base: 'develop' },
	{ upstream: 'PenguinMod-Parser', repo: 'PatternYard-Parser', role: 'engine', base: 'master' },
	{ upstream: 'penguinmod-render-fonts', repo: 'patternyard-render-fonts', role: 'engine', base: 'master' },
	{ upstream: 'penguinmod-svg-renderer', repo: 'patternyard-svg-renderer', role: 'engine', base: 'develop' },

	// Content / docs rendering used by the editor.
	{ upstream: 'PenguinMod-MarkDown', repo: 'PatternYard-MarkDown', role: 'content', base: 'master' },
	{ upstream: 'PenguinMod-MarkDownNew', repo: 'PatternYard-MarkDownNew', role: 'content', base: 'main' },

	// Backend services the editor calls. Forkable + self-hostable.
	{ upstream: 'PenguinMod-ExtensionsGallery', repo: 'PatternYard-ExtensionsGallery', role: 'service', base: 'main' },
	{ upstream: 'PenguinMod-Docs', repo: 'PatternYard-Docs', role: 'service', base: 'main' },

	// Shared libraries / tooling consumed across the stack.
	{ upstream: 'PenguinMod-ApiModule', repo: 'PatternYard-ApiModule', role: 'lib', base: 'main' },
	{ upstream: 'PenguinMod-SvelteUI', repo: 'PatternYard-SvelteUI', role: 'ui', base: 'main' },

	// Standalone deployable: the project packager (TurboWarp packager fork).
	{ upstream: 'PenguinMod-Packager', repo: 'PatternYard-Packager', role: 'packager', base: 'master' },

	// Settled: home frontend + backend API (forked/renamed, not re-forked).
	{ upstream: 'PenguinMod-HomeNew', repo: 'PatternYard-Home', role: 'home', base: 'main', done: true },
	{ upstream: 'PenguinMod-BackendApi', repo: 'PatternYard-BackendApi', role: 'backend', base: 'main', done: true },
];

/** Repos still actively fork-managed (everything not already settled). */
export const TO_FORK = STACK.filter((s) => !s.done);

/**
 * Map of upstream repo name (lowercased) -> renamed fork repo name. Used by the
 * dependency rewriter to translate `github:PenguinMod/<upstream>` specifiers
 * into `github:patternyard/<fork>#WORK_BRANCH`. Lowercased keys because GitHub
 * owner/repo is case-insensitive and upstream specifiers vary in casing.
 */
export const FORK_NAME_BY_UPSTREAM = new Map(STACK.map((s) => [s.upstream.toLowerCase(), s.repo]));
