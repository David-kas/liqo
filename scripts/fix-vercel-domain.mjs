import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FROM = 'https://liqo.pro';
const TO = 'https://liqo24.vercel.app';

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) {
      if (['node_modules', '.git', 'LIQO-ZOMRO', '_import-images'].includes(name)) continue;
      walk(fp, acc);
    } else if (/\.(html|xml|txt|json|webmanifest|js|mjs)$/i.test(name)) {
      acc.push(fp);
    }
  }
  return acc;
}

let changed = 0;
for (const fp of walk(ROOT)) {
  let c = fs.readFileSync(fp, 'utf8');
  const before = c;
  c = c.replaceAll(FROM, TO).replaceAll('https://www.liqo.pro', TO);
  if (c !== before) {
    fs.writeFileSync(fp, c, 'utf8');
    changed++;
  }
}

console.log(`fix-vercel-domain: updated ${changed} files to ${TO}`);
