# Monetizable Information Sites

Two deploy-ready, static-first information websites built for fast launch, SEO, and Google AdSense review.

## Sites

1. `sites/check-the-air` — air quality + weather health utility using Open-Meteo public APIs.
2. `sites/versefinder` — Bible verse lookup, daily verse, and study pages using bible-api.com.

## Fast deployment

Each site is plain static HTML/CSS/JS. Deploy either folder directly to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host.

Recommended Vercel flow is documented in `LAUNCH.md`.

```bash
# Test everything
npm test

# Optional static build copy into dist/
npm run build

# Preview deployments
npm run deploy:air:preview
npm run deploy:verse:preview

# Production deployments, in recommended launch order
npm run deploy:recommended
```

Static roots:

- Check the Air root: `sites/check-the-air`
- Verse Finder root: `sites/versefinder`

## Before Google AdSense

Replace these placeholders in every HTML page:

- `ca-pub-XXXXXXXXXXXXXXXX` with your real AdSense publisher ID.
- `https://checktheair.io` with the real domain.
- `https://versefinder.io` with the real domain.
- Contact email placeholders with a real inbox.

AdSense review usually expects:

- Original useful content
- Privacy policy
- Contact page
- Clear navigation
- No empty pages
- Reasonable amount of content before applying

## API notes

Check the Air:
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Air quality: `https://air-quality-api.open-meteo.com/v1/air-quality`
- Weather: `https://api.open-meteo.com/v1/forecast`

Verse Finder:
- Bible API: `https://bible-api.com/{reference}`

## Monetization plan

Start with Google Ads after content is live. Add affiliate blocks later:

- Check the Air: air purifiers, filters, masks, allergy products.
- Verse Finder: study Bibles, devotionals, journals, Bible courses.
