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

const countBrand = (s) => (s.match(/(?<!\/)PenguinMod/g) || []).length;
const countHost = (s) => (s.match(/penguinmod\.com/gi) || []).length;

let totalFiles = 0, totalBrand = 0, totalHost = 0;
for (const f of files) {
    const path = join(langDir, f);
    const obj = JSON.parse(readFileSync(path, 'utf8'));
    const before = JSON.stringify(obj);
    const out = rebrandLangObject(obj);
    const after = JSON.stringify(out);
    if (before !== after) {
        // count brand + host replacements separately for reporting
        const brand = countBrand(before) - countBrand(after);
        const host = countHost(before) - countHost(after);
        writeFileSync(path, JSON.stringify(out, null, 4) + '\n');
        totalFiles++; totalBrand += brand; totalHost += host;
        console.log(`  ${f}: ${brand} brand, ${host} host`);
    }
}
console.log(`\nDone: ${totalBrand} brand strings + ${totalHost} upstream hosts rewritten across ${totalFiles}/${files.length} locale files.`);
