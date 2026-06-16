// One-time (re-runnable) pass: apply the brand rename to the already-generated
// locale files, so the rebrand is live now without needing a Google Sheet pull.
// Safe to re-run; idempotent. Same transform the pipeline applies on each pull.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { rebrandLangObject } from './rebrand-brand-strings.js';

const here = dirname(fileURLToPath(import.meta.url));
const langDir = join(here, '..', 'src/lib/resources/localization/translation/language');
const files = readdirSync(langDir).filter((f) => f.endsWith('.json'));

let totalFiles = 0, totalChanges = 0;
for (const f of files) {
    const path = join(langDir, f);
    const obj = JSON.parse(readFileSync(path, 'utf8'));
    const before = JSON.stringify(obj);
    const out = rebrandLangObject(obj);
    const after = JSON.stringify(out);
    if (before !== after) {
        // count brand replacements for reporting
        const n = (before.match(/(?<!\/)PenguinMod/g) || []).length - (after.match(/(?<!\/)PenguinMod/g) || []).length;
        writeFileSync(path, JSON.stringify(out, null, 4) + '\n');
        totalFiles++; totalChanges += n;
        console.log(`  ${f}: ${n} brand string(s) rebranded`);
    }
}
console.log(`\nDone: ${totalChanges} brand strings across ${totalFiles}/${files.length} locale files.`);
