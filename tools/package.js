/* Build, then pack everything the server needs into dist/kobold-quest-server.tar.gz (see deploy/README.md) */
const {execFileSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const R=path.join(__dirname,'..');execFileSync('node',[R+'/tools/build.js'],{stdio:'inherit'});
const T=fs.mkdtempSync(path.join(os.tmpdir(),'kqpack-')),D=T+'/kobold-quest';fs.mkdirSync(D+'/server',{recursive:true});
/* every module of the server (a hand-kept list once left admin.js out of the release), its config and package.json */
for(const f of fs.readdirSync(R+'/server').filter(f=>f.endsWith('.js')||f==='config.json'||f==='package.json'))fs.copyFileSync(R+'/server/'+f,D+'/server/'+f);
fs.cpSync(R+'/server/node_modules',D+'/server/node_modules',{recursive:true});fs.cpSync(R+'/server/public',D+'/server/public',{recursive:true});
for(const f of ['install.sh','kq-update.sh','Caddyfile','kobold-quest.service','README.md'])fs.copyFileSync(R+'/deploy/'+f,D+'/'+f);
const build=fs.readFileSync(R+'/dist/BUILD','utf8').trim();fs.writeFileSync(D+'/server/BUILD',build);
/* the packed server must start and report this build, or nothing is released */
{const data=fs.mkdtempSync(path.join(os.tmpdir(),'kqdata-')),port=String(18000+Math.floor(Math.random()*2000));
 const out=execFileSync('node',['-e',`const {spawn}=require('child_process');const c=spawn('node',[${JSON.stringify(D+'/server/main.js')}],{env:Object.assign({},process.env,{PORT:'${port}',DATA:${JSON.stringify(data)}}),stdio:['ignore','ignore','inherit']});
  let n=0;const t=setInterval(()=>{require('http').get('http://127.0.0.1:${port}/status',r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{console.log(b);clearInterval(t);c.kill()})}).on('error',()=>{if(++n>40){console.log('no answer');clearInterval(t);c.kill()}})},250);c.on('exit',()=>clearInterval(t))`],{encoding:'utf8'});
 fs.rmSync(data,{recursive:true,force:true});
 if(!out.includes('"build":"'+build+'"')){console.error('the packed server did not start: '+out.trim());process.exit(1)}}
/* also refresh release/ in the repo: the server's updater installs whatever is in release/ on GitHub */
fs.rmSync(R+'/release',{recursive:true,force:true});fs.cpSync(D,R+'/release',{recursive:true});
fs.chmodSync(D+'/install.sh',0o755);
execFileSync('tar',['czf',R+'/dist/kobold-quest-server.tar.gz','-C',T,'kobold-quest']);
console.log('packed dist/kobold-quest-server.tar.gz',(fs.statSync(R+'/dist/kobold-quest-server.tar.gz').size/1024).toFixed(0)+' KB');
