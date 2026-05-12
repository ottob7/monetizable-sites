import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const root = new URL('..', import.meta.url).pathname;
const sites = {
  'check-the-air': {
    path: 'sites/check-the-air',
    label: 'Check the Air',
  },
  'versefinder': {
    path: 'sites/versefinder',
    label: 'Verse Finder',
  },
};

const siteName = process.argv[2];
const prod = process.argv.includes('--prod');
if (!siteName || !sites[siteName]) {
  console.error('Usage: node scripts/deploy-vercel.mjs <check-the-air|versefinder> [--prod]');
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

function tokenFromHermesEnv() {
  const envPath = join(homedir(), '.hermes', '.env');
  if (!existsSync(envPath)) return '';
  const text = readFileSync(envPath, 'utf8');
  const line = text.split(/\r?\n/).find(x => x.startsWith('VERCEL_TOKEN='));
  if (!line) return '';
  return line.slice('VERCEL_TOKEN='.length).trim().replace(/^['\"]|['\"]$/g, '');
}

const token = process.env.VERCEL_TOKEN || tokenFromHermesEnv();
if (!token) {
  console.error('');
  console.error('VERCEL_TOKEN is not set.');
  console.error('Create one at https://vercel.com/account/tokens');
  console.error('Then either run: export VERCEL_TOKEN=your_token_here');
  console.error('Or add this line to ~/.hermes/.env: VERCEL_TOKEN=your_token_here');
  console.error(`After that: npm run deploy:${siteName === 'check-the-air' ? 'air' : 'verse'}:${prod ? 'prod' : 'preview'}`);
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
