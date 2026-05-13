# Monetizable Information Sites

Static-first information websites built for fast launch, SEO, public API usefulness, and Google AdSense review.

## Sites

1. `sites/check-the-air` — air quality + weather health utility using Open-Meteo public APIs.
2. `sites/versefinder` — Bible verse lookup and study pages using bible-api.com.
3. `sites/recall-radar` — vehicle recall lookup using NHTSA public recall data.
4. `sites/airport-weather-watch` — airport METAR/TAF weather pages using AviationWeather.gov.
5. `sites/uv-index-today` — city UV index and sun-safety pages using Open-Meteo.

## Commands

```bash
npm test
npm run build
npm run deploy:new3:prod
```

## Before Google AdSense

Replace `ca-pub-XXXXXXXXXXXXXXXX` with the real publisher ID and connect real domains/contact inboxes.

## API notes

- NHTSA recalls: `https://api.nhtsa.gov/recalls/recallsByVehicle`
- AviationWeather: `https://aviationweather.gov/api/data/metar` and `/taf`
- Open-Meteo forecast/UV: `https://api.open-meteo.com/v1/forecast`
