const CACHE='ca-shell-v1';
const SHELL=['./','index.html','manifest.json','icon.svg','ca-core.js','ca-keys.js','ca-mouse.js','ca-sim.js','ca-scenes.js','ca-safe.js','ca-kind.js','ca-oops.js','ca-games.js','ca-parent.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return;
  e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
});
