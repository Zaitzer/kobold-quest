/* Build, then pack everything the server needs into dist/kobold-quest-server.tar.gz (see deploy/README.md) */
const {execFileSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const R=path.join(__dirname,'..');execFileSync('node',[R+'/tools/build.js'],{stdio:'inherit'});
const T=fs.mkdtempSync(path.join(os.tmpdir(),'kqpack-')),D=T+'/kobold-quest';fs.mkdirSync(D+'/server',{recursive:true});
for(const f of ['main.js','world.js','store.js','mail.js','config.json','package.json'])fs.copyFileSync(R+'/server/'+f,D+'/server/'+f);
fs.cpSync(R+'/server/node_modules',D+'/server/node_modules',{recursive:true});fs.cpSync(R+'/server/public',D+'/server/public',{recursive:true});
for(const f of ['install.sh','Caddyfile','kobold-quest.service','README.md'])fs.copyFileSync(R+'/deploy/'+f,D+'/'+f);
const build=fs.readFileSync(R+'/dist/BUILD','utf8').trim();fs.writeFileSync(D+'/server/BUILD',build);
/* also refresh release/ in the repo: the server's updater installs whatever is in release/ on GitHub */
fs.rmSync(R+'/release',{recursive:true,force:true});fs.cpSync(D,R+'/release',{recursive:true});
fs.chmodSync(D+'/install.sh',0o755);
execFileSync('tar',['czf',R+'/dist/kobold-quest-server.tar.gz','-C',T,'kobold-quest']);
console.log('packed dist/kobold-quest-server.tar.gz',(fs.statSync(R+'/dist/kobold-quest-server.tar.gz').size/1024).toFixed(0)+' KB');
