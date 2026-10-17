/* Kobold Quest server: serves the website and runs the one shared world over a WebSocket at /ws.
   PORT (default 8080), DATA (default ./data), PUBLIC (default ./public). Put Caddy or another HTTPS proxy in front. */
const http=require('http'),fs=require('fs'),path=require('path');const {WebSocketServer}=require('ws');
const {World}=require('./world.js');const {Mail}=require('./mail.js');
const CONFIG=JSON.parse(fs.readFileSync(path.join(__dirname,'config.json'),'utf8'));const {FileStore}=require('./store.js');
const PORT=+process.env.PORT||8080,DATA=process.env.DATA||path.join(__dirname,'data'),PUB=process.env.PUBLIC||path.join(__dirname,'public');
/* which version of the game this server hands out; players on an older page are told to reload */
let BUILD=process.env.KQ_BUILD||'dev';if(!process.env.KQ_BUILD)try{BUILD=fs.readFileSync(path.join(__dirname,'BUILD'),'utf8').trim()}catch(e){}
const store=new FileStore(DATA),world=new World(store,{build:BUILD,mail:new Mail(store,CONFIG)});
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.webmanifest':'application/manifest+json','.json':'application/json'};
const server=http.createServer((req,res)=>{
  const u=decodeURIComponent((req.url||'/').split('?')[0]);if(u==='/health'){res.end('ok');return}
  if(u==='/robots.txt'){res.writeHead(200,{'content-type':'text/plain'});res.end('User-agent: *\nAllow: /\n');return}
  if(u==='/status'){res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(Object.assign({ok:true,build:BUILD,up:Math.round(process.uptime()),online:world.authed().length,connections:world.conns.size,node:process.version},world.stats())));return}
  let f=path.normalize(path.join(PUB,u==='/'?'index.html':u));if(!f.startsWith(PUB)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(PUB,'index.html');
  res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream','cache-control':f.endsWith('index.html')||f.endsWith('manifest.json')?'no-store, max-age=0':'max-age=3600','x-content-type-options':'nosniff'});
  fs.createReadStream(f).pipe(res)});
const wss=new WebSocketServer({server,path:'/ws',maxPayload:96*1024});
wss.on('connection',(ws,req)=>{
  const conn={ip:(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim(),
    send:o=>{if(ws.readyState===1)ws.send(JSON.stringify(o))},sendRaw:s=>{if(ws.readyState===1)ws.send(s)},end:()=>ws.close()};
  world.open(conn);ws.alive=true;ws.on('pong',()=>{ws.alive=true});
  ws.on('message',d=>world.message(conn,d.toString()));ws.on('close',()=>world.close(conn));ws.on('error',()=>{})});
setInterval(()=>{for(const ws of wss.clients){if(!ws.alive){ws.terminate();continue}ws.alive=false;ws.ping()}},25000).unref();
const stop=()=>{store.flush();process.exit(0)};process.on('SIGTERM',stop);process.on('SIGINT',stop);
server.listen(PORT,()=>console.log('Kobold Quest server on :'+PORT));
