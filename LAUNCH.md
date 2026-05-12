# Launch Plan: Ad-Supported Information Sites

## Recommendation

Launch in this order:

1. **Can I Breathe Today?** — strongest ad/affiliate upside and best recurring utility.
2. **VerseWise** — strong SEO surface area; expand with more verse/topic pages after the first launch.

## Deployment flow

The repo is set up for two independent Vercel static deployments.

### Prerequisite: Vercel token

Create a token:

https://vercel.com/account/tokens

Then in the shell:

```bash
export VERCEL_TOKEN="your_vercel_token"
```

Or save it for Hermes deploy runs in `~/.hermes/.env`:

```bash
printf '\nVERCEL_TOKEN=your_vercel_token\n' >> ~/.hermes/.env
```

Verify:

```bash
npx vercel whoami --token "$VERCEL_TOKEN"
```

If you saved it only in `~/.hermes/.env`, the deploy script will still read it automatically.

### Preview deploys

```bash
cd /home/lenny/monetizable-sites
npm run deploy:air:preview
npm run deploy:verse:preview
```

### Production deploys

```bash
cd /home/lenny/monetizable-sites
npm run deploy:air:prod
npm run deploy:verse:prod
```

Or launch in the recommended order:

```bash
npm run deploy:recommended
```

The deploy script runs `npm test` first and refuses to deploy if checks fail.

## Local development

```bash
npm run dev:air      # http://127.0.0.1:4173
npm run dev:verse    # http://127.0.0.1:4174
```

## AdSense setup

Before applying to Google AdSense:

1. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your AdSense publisher ID.
2. Replace placeholder contact emails if needed.
3. Attach real domains in Vercel:
   - `canibreathetoday.com` or another air-quality domain
   - `versewise.app` or another Bible-site domain
4. In Google Search Console, add each domain and submit:
   - `https://your-air-domain/sitemap.xml`
   - `https://your-verse-domain/sitemap.xml`
5. Wait until Google indexes the sites.
6. Apply for AdSense after pages are live, navigable, and content-rich.

## Vercel domains after deployment

Once deployed, Vercel gives each site a `.vercel.app` URL. Add custom domains in Vercel dashboard:

Project → Settings → Domains → Add Domain

Then update canonical URLs and sitemap domains in the files before final production deploy.

## Current static roots

Can I Breathe Today:

```text
/home/lenny/monetizable-sites/sites/can-i-breathe-today
```

VerseWise:

```text
/home/lenny/monetizable-sites/sites/versewise
```

## Expansion after launch

Can I Breathe Today:
- Add top 100 US city AQI pages.
- Add state wildfire smoke pages.
- Add "safe to run outside" pages.
- Add affiliate blocks for air purifiers, HVAC filters, masks, and allergy products.

VerseWise:
- Add 100+ verse pages.
- Add topic pages: anxiety, grief, forgiveness, marriage, parenting, hope, fear, anger.
- Add reading plans and email capture.
- Add affiliate links to study Bibles, journals, and devotionals.
