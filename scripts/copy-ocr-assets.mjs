import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'tesseract');
const coreOutDir = path.join(outDir, 'core');
const langOutDir = path.join(outDir, 'lang');

fs.mkdirSync(coreOutDir, { recursive: true });
fs.mkdirSync(langOutDir, { recursive: true });

// Worker bundle
const workerSrc = path.join(root, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js');
if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, path.join(outDir, 'worker.min.js'));
}

// Core wasm/js files
const coreSrcDir = path.join(root, 'node_modules', 'tesseract.js-core');
if (fs.existsSync(coreSrcDir)) {
  for (const file of fs.readdirSync(coreSrcDir)) {
    if (/^tesseract-core.*\.(js|wasm)$/i.test(file)) {
      fs.copyFileSync(path.join(coreSrcDir, file), path.join(coreOutDir, file));
    }
  }
}

// English traineddata (prefer 4.0.0_best_int, fallback 4.0.0)
const langCandidates = [
  path.join(root, 'node_modules', '@tesseract.js-data', 'eng', '4.0.0_best_int', 'eng.traineddata.gz'),
  path.join(root, 'node_modules', '@tesseract.js-data', 'eng', '4.0.0', 'eng.traineddata.gz'),
];
const langSrc = langCandidates.find(p => fs.existsSync(p));
if (langSrc) {
  fs.copyFileSync(langSrc, path.join(langOutDir, 'eng.traineddata.gz'));
}

console.log('Copied local Tesseract OCR assets to public/tesseract');
