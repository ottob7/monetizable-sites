import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const sites = {
  'can-i-breathe-today': {
    path: 'sites/can-i-breathe-today',
    label: 'Can I Breathe Today?',
  },
  'versewise': {
    path: 'sites/versewise',
    label: 'VerseWise',
  },
};

const siteName = process.argv[2];
const prod = process.argv.includes('--prod');
if (!siteName || !sites[siteName]) {
  console.error('Usage: node scripts/deploy-vercel.mjs <can-i-breathe-today|versewise> [--prod]');
  process.exit(1);
}

const site = sites[siteName];
const siteDir = join(root, site.path);
if (!existsSync(siteDir)) {
  console.error(`Missing site directory: ${siteDir}`);
  process.exit(1);
}

console.log('');
console.log(`Deploying ${site.label} to Vercel (${prod ? 'production' : 'preview'})`);
console.log(`Site directory: ${siteDir}`);
console.log('');

const test = spawnSync('npm', ['test'], { cwd: root, stdio: 'inherit', shell: false });
if (test.status !== 0) process.exit(test.status ?? 1);

const token = process.env.VERCEL_TOKEN || '';
if (!token) {
  console.error('');
  console.error('VERCEL_TOKEN is not set.');
  console.error('Create one at https://vercel.com/account/tokens');
  console.error('Then run: export VERCEL_TOKEN=your_token_here');
  console.error(`After that: npm run deploy:${siteName === 'can-i-breathe-today' ? 'air' : 'verse'}:${prod ? 'prod' : 'preview'}`);
  process.exit(2);
}

const args = ['vercel', 'deploy', siteDir, '--yes', '--token', token];
if (prod) args.push('--prod');
const result = spawnSync('npx', args, { cwd: root, encoding: 'utf8', shell: false });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.status !== 0) process.exit(result.status ?? 1);

const lines = result.stdout.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
const url = [...lines].reverse().find(x => /^https:\/\//.test(x));
if (url) {
  const out = join(root, `.last-deploy-${siteName}${prod ? '-prod' : '-preview'}.txt`);
  writeFileSync(out, `${url}\n`, 'utf8');
  console.log('');
  console.log(`Deployment URL saved to ${out}`);
}
