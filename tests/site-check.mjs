import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const sites = [
  { dir: 'can-i-breathe-today', title: 'Can I Breathe Today?', required: ['index.html', 'privacy.html', 'contact.html', 'robots.txt', 'sitemap.xml', 'assets/app.js', 'assets/styles.css'] },
  { dir: 'versewise', title: 'VerseWise', required: ['index.html', 'privacy.html', 'contact.html', 'robots.txt', 'sitemap.xml', 'assets/app.js', 'assets/styles.css'] },
];
let failures = [];
for (const site of sites) {
  const base = join(root, 'sites', site.dir);
  for (const file of site.required) {
    const p = join(base, file);
    if (!existsSync(p)) failures.push(`${site.dir}: missing ${file}`);
  }
  const index = join(base, 'index.html');
  if (existsSync(index)) {
    const html = readFileSync(index, 'utf8');
    for (const needle of [site.title, 'googlesyndication.com/pagead/js/adsbygoogle.js', 'Privacy', 'Contact', 'sitemap.xml']) {
      if (!html.includes(needle)) failures.push(`${site.dir}: index missing ${needle}`);
    }
    if (!/<meta name="description" content=".{80,}"/.test(html)) failures.push(`${site.dir}: weak meta description`);
    if (!html.includes('application/ld+json')) failures.push(`${site.dir}: missing JSON-LD`);
  }
  const sitemap = join(base, 'sitemap.xml');
  if (existsSync(sitemap)) {
    const xml = readFileSync(sitemap, 'utf8');
    const urls = (xml.match(/<url>/g) || []).length;
    if (urls < 8) failures.push(`${site.dir}: sitemap has only ${urls} urls`);
  }
}
if (failures.length) {
  console.error('Site checks failed:');
  for (const f of failures) console.error(' - ' + f);
  process.exit(1);
}
console.log('All site checks passed.');
