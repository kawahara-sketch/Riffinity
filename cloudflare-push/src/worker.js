import webpush from 'web-push';
import {decide,jstDay,jstHour,validDay} from './logic.js';
const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':'https://kawahara-sketch.github.io','Access-Control-Allow-Headers':'Authorization,Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
const sha=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const fail=(message,status=400)=>json({error:message},status);
function allowed(req){const origin=req.headers.get('Origin');return !origin||origin==='https://kawahara-sketch.github.io'}
function isEndpoint(s){try{const u=new URL(s);return u.protocol==='https:'&&u.hostname.length>0&&s.length<2048}catch{return false}}
function isSubscription(s){return s&&typeof s==='object'&&isEndpoint(s.endpoint)&&typeof s.keys?.p256dh==='string'&&typeof s.keys?.auth==='string'}
function validSettings(s){return Number.isInteger(s.hour)&&s.hour>=0&&s.hour<=23&&typeof s.enabled==='boolean'&&validDay(s.completedDay??null)&&Number.isInteger(s.freezes)&&s.freezes>=0&&s.freezes<=100&&Number.isInteger(s.streak)&&s.streak>=0&&s.streak<=100000}
async function auth(req){const h=req.headers.get('Authorization')||'';const token=h.startsWith('Bearer ')?h.slice(7):'';if(token.length<32||token.length>256)return null;return sha(token)}
export default {
 async fetch(req,env){
  if(!allowed(req))return fail('Origin not allowed',403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  const path=new URL(req.url).pathname;
  if(req.method==='GET'&&path==='/health')return json({ok:true});
  if(req.method==='GET'&&path==='/config')return json({publicKey:env.VAPID_PUBLIC_KEY});
  if(req.method!=='POST'||!['/subscribe','/status','/unsubscribe'].includes(path))return fail('Not found',404);
  const tokenHash=await auth(req);if(!tokenHash)return fail('Unauthorized',401);
  let body;try{if(Number(req.headers.get('Content-Length')||0)>16384)return fail('Too large',413);body=await req.json()}catch{return fail('Invalid JSON')}
  if(path==='/subscribe'){
   if(!isSubscription(body.subscription)||!validSettings(body))return fail('Invalid subscription or settings');
   const s=body.subscription;
   await env.DB.prepare('INSERT INTO devices(endpoint,subscription,token_hash,hour,enabled,completed_day,freezes,streak) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET subscription=excluded.subscription,hour=excluded.hour,enabled=excluded.enabled,completed_day=excluded.completed_day,freezes=excluded.freezes,streak=excluded.streak,updated_at=CURRENT_TIMESTAMP WHERE devices.token_hash=excluded.token_hash').bind(s.endpoint,JSON.stringify(s),tokenHash,body.hour,Number(body.enabled),body.completedDay??null,body.freezes,body.streak).run();
   const row=await env.DB.prepare('SELECT token_hash FROM devices WHERE endpoint=?').bind(s.endpoint).first();return row?.token_hash===tokenHash?json({ok:true}):fail('Endpoint belongs to another device',403);
  }
  if(!isEndpoint(body.endpoint))return fail('Invalid endpoint');
  const row=await env.DB.prepare('SELECT token_hash FROM devices WHERE endpoint=?').bind(body.endpoint).first();if(!row||row.token_hash!==tokenHash)return fail('Not found',404);
  if(path==='/unsubscribe'){await env.DB.prepare('DELETE FROM devices WHERE endpoint=? AND token_hash=?').bind(body.endpoint,tokenHash).run();return json({ok:true})}
  if(!validSettings(body))return fail('Invalid settings');
  await env.DB.prepare('UPDATE devices SET hour=?,enabled=?,completed_day=?,freezes=?,streak=?,updated_at=CURRENT_TIMESTAMP WHERE endpoint=? AND token_hash=?').bind(body.hour,Number(body.enabled),body.completedDay??null,body.freezes,body.streak,body.endpoint,tokenHash).run();return json({ok:true});
 },
 async scheduled(event,env,ctx){ctx.waitUntil(sendDue(env,new Date(event.scheduledTime)))}
};
async function sendDue(env,now){
 const day=jstDay(now),hour=jstHour(now);
 webpush.setVapidDetails(env.VAPID_SUBJECT,env.VAPID_PUBLIC_KEY,env.VAPID_PRIVATE_KEY);
 let cursor='';
 while(true){
  const {results}=await env.DB.prepare('SELECT * FROM devices WHERE enabled=1 AND hour=? AND endpoint>? ORDER BY endpoint LIMIT 50').bind(hour,cursor).all();
  if(!results.length)break;
  for(const row of results){
   cursor=row.endpoint;const message=decide(row,day);if(!message)continue;
   // Claim the day before sending to prevent duplicates across overlapping cron runs.
   const claim=await env.DB.prepare('UPDATE devices SET last_sent_day=? WHERE endpoint=? AND (last_sent_day IS NULL OR last_sent_day<>?) AND enabled=1 AND (completed_day IS NULL OR completed_day<>?)').bind(day,row.endpoint,day,day).run();
   if(!claim.meta?.changes)continue;
   try{await webpush.sendNotification(JSON.parse(row.subscription),JSON.stringify({title:message.title,body:message.body,tag:'riffinity-daily',kind:message.kind}),{TTL:3600})}
   catch(e){if(e.statusCode===404||e.statusCode===410)await env.DB.prepare('DELETE FROM devices WHERE endpoint=?').bind(row.endpoint).run();else console.error('Push failed',e.statusCode||e.message)}
  }
  if(results.length<50)break;
 }
}
