const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const SNAPSHOT = join(process.cwd(), 'data', 'ram-prices.json');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method && req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  if (!existsSync(SNAPSHOT)) return json(res, 404, { status: 'missing', message: 'Price snapshot has not been generated yet.' });
  const data = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
  return json(res, 200, {
    ...data,
    visitorApiUsage: 'none: this endpoint only serves the generated static snapshot; it does not call SerpApi per visitor'
  });
};
