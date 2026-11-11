/* Riffinity offline shell: only same-origin GET assets, never cache user records. */
const CACHE='riffinity-shell-v2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('riffinity-shell-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;event.respondWith(fetch(req).then(response=>{if(response.ok&&new URL(req.url).pathname.match(/\/(?:index\.html|manifest\.webmanifest|icon\.svg)?$/)){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)))}return response}).catch(()=>caches.match(req).then(cached=>cached||caches.match('./index.html'))))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{const url=new URL('./',self.registration.scope).href;for(const client of clients){if(client.url.startsWith(url)){await client.focus();return}}await self.clients.openWindow(url)}))});

/* Push delivery receiver. Subscribing and scheduling require a separate backend. */
self.addEventListener('push',event=>{
 let payload={};try{payload=event.data?event.data.json():{}}catch(_){payload={body:event.data?.text()||''}}
 const title=typeof payload.title==='string'?payload.title.slice(0,80):'Riffinity';
 const body=typeof payload.body==='string'?payload.body.slice(0,240):'今日も3分、楽器に触れてみましょう。';
 event.waitUntil(self.registration.showNotification(title,{body,icon:'./icon.svg',badge:'./icon.svg',tag:'riffinity-daily',data:{url:new URL('./',self.registration.scope).href}}));
});
