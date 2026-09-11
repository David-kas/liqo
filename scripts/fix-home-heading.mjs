import fs from 'node:fs';
import path from 'node:path';

const targets = [
  path.join(process.cwd(), 'index.html'),
  path.join(process.cwd(), 'public', 'index.html'),
];

for (const file of targets) {
  if (!fs.existsSync(file)) continue;

  const html = fs.readFileSync(file, 'utf8');
  const updated = html.replace(
    /<h1>Круглосуточная доставка алкоголя Москва<\/h1>/g,
    '<h1>Круглосуточная доставка алкоголя на дом Москва 24/7</h1>',
  );

  if (updated !== html) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`Home heading updated: ${file}`);
  }
}
