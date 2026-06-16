// Deterministic PenguinMod -> PatternYard brand rename for localized strings.
//
// Applied in two places so the rebrand survives Google Sheet re-pulls:
//   1. translation-from-sheet.js  — after each sheet pull, before writing.
//   2. apply-rebrand-to-locales.mjs — one-time pass over already-generated files.
//
// Intentionally NOT touched (each is a separate concern):
//   - URL paths/domains (e.g. .../PenguinMod-Guidelines, penguinmod.com) -> infra (§0b)
//   - other brands (Scratch, TurboWarp, Scratch Team/Foundation) -> not ours to rename
//   - JSON keys / sheet metadata -> identifiers, not user-visible copy

const NEW = 'PatternYard';

// Capitalized brand token only, EXCEPT when part of a URL path (preceded by '/').
// Lowercase 'penguinmod' (only ever seen in domains like penguinmod.com) is left as-is.
const BRAND_RE = /(?<!\/)PenguinMod/g;

export function rebrandValue(value) {
    if (typeof value !== 'string') return value;
    return value.replace(BRAND_RE, NEW);
}

// Transform only the values of a flat locale object; keys are identifiers.
export function rebrandLangObject(langObject) {
    const out = {};
    for (const [key, value] of Object.entries(langObject)) {
        out[key] = rebrandValue(value);
    }
    return out;
}
