import { json } from '../_utils.js';
export async function onRequestGet(){
 const url='https://news.google.com/rss/search?q='+encodeURIComponent('افغانستان')+'&hl=fa&gl=AF&ceid=AF:fa';
 const r=await fetch(url,{headers:{'User-Agent':'Yar-Afghanistan/1.0'}}); const xml=await r.text(); if(!r.ok)return json({success:false,error:'اخبار دریافت نشد.'},502);
 const items=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,10).map(m=>{const s=m[1];const get=t=>{const x=s.match(new RegExp(`<${t}>([\\s\\S]*?)<\\/${t}>`));return x?x[1].replace(/<!\[CDATA\[|\]\]>/g,'').trim():''};return {title:get('title'),link:get('link'),pubDate:get('pubDate')}});
 return json({success:true,items});
}
