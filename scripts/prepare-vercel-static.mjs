import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public');
const EXCLUDED = new Set(['.git', '.github', 'node_modules', 'public', 'scripts', 'api', 'telegram', 'config', 'LIQO-ZOMRO', '_import-images']);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function copyTree(src, dst) {
  for (const name of fs.readdirSync(src)) {
    if (EXCLUDED.has(name)) continue;
    const from = path.join(src, name);
    const to = path.join(dst, name);
    const stat = fs.lstatSync(from);
    if (stat.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyTree(from, to);
    } else if (stat.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

copyTree(ROOT, OUT);
console.log(`Vercel static output prepared: ${OUT}`);
