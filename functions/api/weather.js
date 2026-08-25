import { json } from '../_utils.js';
export async function onRequestGet(context){
 const city=new URL(context.request.url).searchParams.get('city'); if(!city)return json({success:false,error:'city لازم است.'},400);
 const g=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`); const gd=await g.json(); const x=gd?.results?.[0]; if(!x)return json({success:false,error:'شهر پیدا نشد.'},404);
 const w=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${x.latitude}&longitude=${x.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`); const wd=await w.json(); return json({success:true,city:x.name,country:x.country,latitude:x.latitude,longitude:x.longitude,current:wd.current});
}
