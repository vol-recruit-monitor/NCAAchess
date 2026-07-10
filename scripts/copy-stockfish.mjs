// Copies the single-threaded Stockfish WASM build from node_modules into
// public/stockfish so the app can load it as a Web Worker without any
// cross-origin-isolation (COOP/COEP) headers. Runs on postinstall and
// before dev/build, so a fresh clone works with plain `npm install`.
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'node_modules', 'stockfish', 'src');
const outDir = join(root, 'public', 'stockfish');

if (!existsSync(srcDir)) {
  console.warn('[copy-stockfish] stockfish package not installed yet; skipping.');
  process.exit(0);
}

// Prefer the "lite single" build: single-threaded (no SharedArrayBuffer
// requirement) and a small NNUE net, ideal for a client-side opponent.
const files = readdirSync(srcDir);
const pick = (patterns) => {
  for (const p of patterns) {
    const js = files.find((f) => p.test(f) && f.endsWith('.js'));
    if (js) return js;
  }
  return null;
};

const engineJs = pick([
  /lite-single/, // e.g. stockfish-17.1-lite-single.js
  /single/, // any single-threaded fallback
]);

if (!engineJs) {
  console.error('[copy-stockfish] No single-threaded stockfish build found in', srcDir);
  process.exit(1);
}

const base = engineJs.replace(/\.js$/, '');
mkdirSync(outDir, { recursive: true });

let copied = 0;
for (const f of files) {
  // Copy the engine JS plus all of its parts (wasm, nnue, part files).
  if (f.startsWith(base)) {
    cpSync(join(srcDir, f), join(outDir, f));
    copied++;
  }
}

// The engine filename carries a build hash, so publish it in a manifest the
// app fetches at runtime to locate the worker script.
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify({ engine: engineJs }));

console.log(`[copy-stockfish] Copied ${copied} file(s) for ${engineJs} -> public/stockfish/`);