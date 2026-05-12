const $ = (s) => document.querySelector(s);
const cities = [
  ['Los Angeles, CA',34.0522,-118.2437],['New York, NY',40.7128,-74.0060],['Austin, TX',30.2672,-97.7431],['Chicago, IL',41.8781,-87.6298],['Phoenix, AZ',33.4484,-112.0740],['Seattle, WA',47.6062,-122.3321],['Denver, CO',39.7392,-104.9903],['Miami, FL',25.7617,-80.1918],['Atlanta, GA',33.7490,-84.3880],['San Francisco, CA',37.7749,-122.4194],['Portland, OR',45.5152,-122.6784],['Dallas, TX',32.7767,-96.7970]
];
const advice = (pm25=0, aqi=0) => {
  const score = Math.max(aqi||0, pm25<=12?35:pm25<=35.4?80:pm25<=55.4?130:pm25<=150.4?180:250);
  if (score <= 50) return {label:'Good', cls:'status-good', text:'Great day for most outdoor activity. Open windows if pollen and weather are comfortable.'};
  if (score <= 100) return {label:'Moderate', cls:'status-moderate', text:'Usually acceptable, but unusually sensitive people should shorten intense outdoor exercise.'};
  if (score <= 150) return {label:'Unhealthy for Sensitive Groups', cls:'status-bad', text:'Children, older adults, and people with asthma or heart/lung conditions should reduce prolonged outdoor exertion.'};
  return {label:'Unhealthy', cls:'status-bad', text:'Limit outdoor activity, close windows, and consider filtered indoor air.'};
};
async function geocode(q){
  const url=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
  const r=await fetch(url); if(!r.ok) throw new Error('Could not search that place.');
  const data=await r.json(); if(!data.results?.length) throw new Error('No matching city found. Try “Austin” or “Los Angeles”.');
  const x=data.results[0]; return {name:`${x.name}${x.admin1?`, ${x.admin1}`:''}${x.country?`, ${x.country}`:''}`, lat:x.latitude, lon:x.longitude};
}
async function fetchAir({name,lat,lon}){
  const air=`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto`;
  const wx=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&timezone=auto`;
  const [ar,wr]=await Promise.all([fetch(air),fetch(wx)]);
  if(!ar.ok || !wr.ok) throw new Error('Live data is temporarily unavailable.');
  const [a,w]=await Promise.all([ar.json(),wr.json()]);
  return {name, air:a.current||{}, weather:w.current||{}, units:{...(a.current_units||{}),...(w.current_units||{})}};
}
function render(d){
  const a=d.air,w=d.weather,u=d.units, adv=advice(a.pm2_5,a.us_aqi);
  $('#result').innerHTML=`<div class="grid"><section class="card"><h2>${d.name}</h2><p class="muted">Latest local air quality and weather-health reading.</p><div class="metric ${adv.cls}">${a.us_aqi ?? '—'}</div><p class="muted">US AQI</p></section><section class="card"><h3>Can I breathe today?</h3><h2 class="${adv.cls}">${adv.label}</h2><p class="muted">${adv.text}</p></section><section class="card"><h3>Weather context</h3><p><strong>${w.temperature_2m ?? '—'}${u.temperature_2m||''}</strong> temperature</p><p><strong>${w.relative_humidity_2m ?? '—'}${u.relative_humidity_2m||''}</strong> humidity</p><p><strong>${w.wind_speed_10m ?? '—'} ${u.wind_speed_10m||''}</strong> wind</p></section></div><div class="grid" style="margin-top:16px"><div class="card"><h3>PM2.5</h3><div class="metric">${a.pm2_5 ?? '—'}</div><p class="muted">Fine particles ${u.pm2_5||'µg/m³'}</p></div><div class="card"><h3>PM10</h3><div class="metric">${a.pm10 ?? '—'}</div><p class="muted">Coarse particles ${u.pm10||'µg/m³'}</p></div><div class="card"><h3>Ozone</h3><div class="metric">${a.ozone ?? '—'}</div><p class="muted">Ozone ${u.ozone||'µg/m³'}</p></div></div>`;
}
async function run(q){
  $('#result').innerHTML='<div class="card loading">Checking live public air-quality data…</div>';
  try{const loc=Array.isArray(q)?{name:q[0],lat:q[1],lon:q[2]}:await geocode(q); render(await fetchAir(loc)); history.replaceState(null,'',`#${encodeURIComponent(loc.name)}`)}catch(e){$('#result').innerHTML=`<div class="card"><h2>Could not load data</h2><p class="muted">${e.message}</p></div>`}
}
window.addEventListener('DOMContentLoaded',()=>{
  $('#cityForm')?.addEventListener('submit',e=>{e.preventDefault(); const q=$('#city').value.trim(); if(q) run(q)});
  document.querySelectorAll('[data-city]').forEach(b=>b.addEventListener('click',()=>run(cities.find(c=>c[0]===b.dataset.city))));
  if(window.DEFAULT_CITY) run(window.DEFAULT_CITY); else if(location.hash) run(decodeURIComponent(location.hash.slice(1))); else run(cities[0]);
});