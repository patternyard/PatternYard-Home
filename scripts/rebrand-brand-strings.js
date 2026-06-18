// Deterministic PenguinMod -> PatternYard brand + host rename for localized strings.
//
// Applied in two places so the rebrand survives Google Sheet re-pulls:
//   1. translation-from-sheet.js  — after each sheet pull, before writing.
//   2. apply-rebrand-to-locales.mjs — one-time pass over already-generated files.
//
// Two independent rewrites happen here:
//   A. Brand token  : capitalized "PenguinMod" -> "PatternYard" in user-visible copy.
//   B. Runtime host : *.penguinmod.com -> the patternyard.dev equivalent, so localized
//                      copy carries ZERO upstream runtime hosts (runtime-independence goal).
//
// Intentionally NOT touched (each is a separate concern):
//   - URL *path* segments (e.g. /PenguinMod-Guidelines/PROJECTS, /devposts/...) — these are
//     routes on our OWN host now, and must match what the studio/home apps actually serve.
//     Renaming a path blindly would create dead links; that is a content/routing decision.
//   - other brands (Scratch, TurboWarp, Scratch Team/Foundation) -> not ours to rename
//   - JSON keys / sheet metadata -> identifiers, not user-visible copy

const NEW = 'PatternYard';

// Capitalized brand token only, EXCEPT when part of a URL path (preceded by '/').
const BRAND_RE = /(?<!\/)PenguinMod/g;

// Runtime host map: specific upstream hosts -> their patternyard.dev equivalent.
// Any *.penguinmod.com host not listed keeps its subdomain label on patternyard.dev.
// No upstream fallback — the result never contains penguinmod.com.
const HOST_MAP = {
    'studio.penguinmod.com': 'studio.patternyard.dev',
    'api.penguinmod.com': 'api.patternyard.dev',
    'projects.penguinmod.com': 'patternyard.dev',
    'penguinmod.com': 'patternyard.dev',
};

// Match a whole `(sub.)*penguinmod.com` host at a word boundary (so `mypenguinmod.com`
// or a path segment is never partially matched).
const HOST_RE = /\b(?:[a-z0-9-]+\.)*penguinmod\.com\b/gi;

function rewriteHosts(value) {
    return value.replace(HOST_RE, (match) => {
        const host = match.toLowerCase();
        if (HOST_MAP[host]) return HOST_MAP[host];
        // Unknown subdomain (e.g. "foo.penguinmod.com") -> "foo.patternyard.dev".
        const sub = host.slice(0, -'penguinmod.com'.length);
        return `${sub}patternyard.dev`;
    });
}

export function rebrandValue(value) {
    if (typeof value !== 'string') return value;
    return rewriteHosts(value.replace(BRAND_RE, NEW));
}

// Transform only the values of a flat locale object; keys are identifiers.
export function rebrandLangObject(langObject) {
    const out = {};
    for (const [key, value] of Object.entries(langObject)) {
        out[key] = rebrandValue(value);
    }
    return out;
}
