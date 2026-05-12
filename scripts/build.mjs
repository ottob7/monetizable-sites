import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const site of ['check-the-air', 'versefinder']) {
  cpSync(join(root, 'sites', site), join(dist, site), { recursive: true });
}
console.log('Built static sites into dist/.');
