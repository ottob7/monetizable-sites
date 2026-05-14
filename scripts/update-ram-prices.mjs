import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const outDir = join(root, 'sites', 'ram-price-checker', 'data');
const outFile = join(outDir, 'ram-prices.json');

const SAMPLE_KITS = [
  { name: 'DDR5 32GB 6000 CL30 desktop kit', brand: 'G.Skill / Corsair class', gen: 'DDR5', capacity: 32, speed: 6000, latency: 'CL30', price: 104.99, currency: 'USD', trend: 'sample', confidence: 70, note: 'Sample fallback for current gaming and creator builds.', url: 'https://www.google.com/search?tbm=shop&q=DDR5+32GB+6000+CL30+desktop+kit' },
  { name: 'DDR5 64GB 6000 CL32 desktop kit', brand: 'TeamGroup / Kingston class', gen: 'DDR5', capacity: 64, speed: 6000, latency: 'CL32', price: 199.99, currency: 'USD', trend: 'sample', confidence: 70, note: 'Sample fallback for workstation and local AI workloads.', url: 'https://www.google.com/search?tbm=shop&q=DDR5+64GB+6000+desktop+kit' },
  { name: 'DDR4 32GB 3600 CL18 desktop kit', brand: 'Corsair / Silicon Power class', gen: 'DDR4', capacity: 32, speed: 3600, latency: 'CL18', price: 61.99, currency: 'USD', trend: 'sample', confidence: 70, note: 'Sample fallback for older AM4 and LGA1200 systems.', url: 'https://www.google.com/search?tbm=shop&q=DDR4+32GB+3600+desktop+kit' },
  { name: 'Laptop DDR5 32GB 5600 SODIMM', brand: 'Crucial / Kingston class', gen: 'Laptop', capacity: 32, speed: 5600, latency: 'SODIMM', price: 89.99, currency: 'USD', trend: 'sample', confidence: 70, note: 'Sample fallback for laptop creator upgrades.', url: 'https://www.google.com/search?tbm=shop&q=Laptop+DDR5+32GB+5600+SODIMM' }
];

const QUERIES = [
  { label: 'DDR5 32GB', query: 'DDR5 32GB 6000 CL30 RAM kit' },
  { label: 'DDR5 64GB', query: 'DDR5 64GB 6000 RAM kit' },
  { label: 'DDR5 96GB', query: 'DDR5 96GB 6400 RAM kit' },
  { label: 'DDR4 32GB', query: 'DDR4 32GB 3600 RAM kit' },
  { label: 'DDR4 64GB', query: 'DDR4 64GB 3200 RAM kit' },
  { label: 'Laptop DDR5 32GB', query: 'laptop DDR5 32GB 5600 SODIMM RAM' }
];

function parseMoney(value) {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  const match = String(value).replace(/,/g, '').match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  return match ? Number(match[1]) : null;
}
function inferCapacity(text) {
  const s = String(text || '');
  const tb = s.match(/(1|2)\s*TB/i);
  if (tb) return Number(tb[1]) * 1024;
  const gb = s.match(/(16|24|32|48|64|96|128|192)\s*GB/i);
  return gb ? Number(gb[1]) : null;
}
function inferGen(text) {
  const s = String(text || '').toUpperCase();
  if (s.includes('SODIMM') || s.includes('SO-DIMM') || s.includes('LAPTOP')) return 'Laptop';
  if (s.includes('DDR5')) return 'DDR5';
  if (s.includes('DDR4')) return 'DDR4';
  return 'RAM';
}
function inferSpeed(text) {
  const m = String(text || '').match(/(3200|3600|4800|5200|5600|6000|6400|6800|7200|7600|8000)\s*(?:MT\/s|MHz)?/i);
  return m ? Number(m[1]) : 0;
}
function confidence(name, query, price, capacity) {
  const text = `${name} ${query}`.toUpperCase();
  let score = 40;
  if (/\b(DDR4|DDR5)\b/.test(text)) score += 20;
  if (/\b(RAM|MEMORY|SODIMM|SO-DIMM)\b/.test(text)) score += 15;
  if (inferCapacity(name) || inferCapacity(query)) score += 10;
  if (inferSpeed(name) || inferSpeed(query)) score += 5;
  if (price > 20 && price < 1000) score += 10;
  if (capacity && price / capacity > 1 && price / capacity < 20) score += 10;
  if (/CASE|SSD|FLASH|USB|HEATSINK ONLY|COVER/.test(text)) score -= 35;
  return Math.max(0, Math.min(100, score));
}
function normalizeItem(item, queryMeta) {
  const name = item.title || item.name || queryMeta.query;
  const price = parseMoney(item.price || item.extracted_price || item.priceValue || item.currentPrice);
  const capacity = inferCapacity(name) || inferCapacity(queryMeta.query) || 32;
  const gen = inferGen(`${name} ${queryMeta.query}`);
  const speed = inferSpeed(name) || inferSpeed(queryMeta.query);
  const score = confidence(name, queryMeta.query, price, capacity);
  return {
    name,
    brand: item.source || item.seller || 'Google Shopping',
    gen,
    capacity,
    speed,
    latency: (String(name).match(/CL\s?\d{2}/i) || [''])[0] || 'see listing',
    price,
    currency: item.currency || 'USD',
    trend: 'snapshot',
    confidence: score,
    note: `Daily price snapshot for ${queryMeta.label}. Verify seller, shipping, tax, compatibility, and final checkout price before purchase.`,
    url: item.link || item.url || item.product_link || '#',
    image: item.thumbnail || item.image,
    provider: 'SerpApi Google Shopping',
    query: queryMeta.query,
    queryLabel: queryMeta.label,
    pricePerGb: price && capacity ? Number((price / capacity).toFixed(2)) : null
  };
}

async function serpApiSearch(queryMeta) {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google_shopping');
  url.searchParams.set('q', queryMeta.query);
  url.searchParams.set('gl', 'us');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('api_key', key);
  const res = await fetch(url, { headers: { 'User-Agent': 'ram-price-checker-snapshot/1.0' } });
  if (!res.ok) throw new Error(`SerpApi ${res.status} for ${queryMeta.label}`);
  const data = await res.json();
  return (data.shopping_results || [])
    .slice(0, 12)
    .map(x => normalizeItem(x, queryMeta))
    .filter(x => x.price && /ram|ddr|sodimm|so-dimm|memory/i.test(`${x.name} ${queryMeta.query}`))
    .filter(x => x.confidence >= 55);
}

async function main() {
  const errors = [];
  let items = [];
  for (const queryMeta of QUERIES) {
    try {
      const found = await serpApiSearch(queryMeta);
      items = items.concat(found);
    } catch (err) {
      errors.push(err.message);
    }
  }
  const seen = new Set();
  items = items
    .filter(x => {
      const key = `${x.name}|${x.price}|${x.brand}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.confidence - a.confidence) || (a.pricePerGb - b.pricePerGb))
    .slice(0, 48);

  const status = items.length ? 'snapshot' : 'sample';
  const body = {
    status,
    provider: items.length ? 'SerpApi Google Shopping daily snapshot' : 'sample watchlist',
    updatedAt: new Date().toISOString(),
    cadence: 'daily',
    visitorApiUsage: 'none: visitors read this static JSON snapshot; SerpApi is called only by the scheduled updater',
    queries: QUERIES.map(x => x.query),
    itemCount: items.length || SAMPLE_KITS.length,
    items: items.length ? items : SAMPLE_KITS,
    errors
  };
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, JSON.stringify(body, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${outFile}`);
  console.log(`status=${body.status} items=${body.itemCount} errors=${errors.length}`);
  if (errors.length) console.log(errors.join('\n'));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
