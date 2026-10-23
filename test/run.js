/* The whole test suite: `node test/run.js` (add `quick` to skip the browser scenarios).
   1 build · 2 logic tests in Node (parity with v37, saves, wiring) · 3 a balance sim · 4 browser scenarios at phone and desktop sizes,
   including two- and three-player online play over a mocked room and database. */
const {execFileSync,spawnSync,spawn}=require('child_process');const path=require('path'),fs=require('fs');
const R=path.join(__dirname,'..');const quick=process.argv.includes('quick');
const results=[];
function judge(name,t0,status,stdout,stderr){
  const out=((stdout||'')+(stderr||'')).split('\n').filter(l=>l&&!/agent-proxy|fonts\.googleapis|Allowed hosts|For details|^- |ERR_TUNNEL|Failed to load resource/.test(l));
  const bad=status!==0||out.some(l=>/Error|FAIL|errors \[ *'[^\]]*[^' \]]/.test(l)&&!/errors \[ *('')? *\]/.test(l));
  results.push([bad?'FAIL':'ok  ',name,((Date.now()-t0)/1000).toFixed(0)+'s',(bad?out.filter(l=>/Error|FAIL|errors/.test(l)).slice(0,3).join(' | '):out[out.length-1]||'').slice(0,160)]);
  console.log(results[results.length-1].join('  '))}
function run(name,file,args,env,timeout){const t0=Date.now();
  const r=spawnSync('node',[file].concat(args||[]),{cwd:path.dirname(file),env:Object.assign({},process.env,env||{}),encoding:'utf8',timeout:timeout||600000});
  judge(name,t0,r.status,r.stdout,r.stderr)}
/* browser scenarios mostly wait on timers, so several run at once (BROWSERS=n, default 3) */
function runAll(list,n){return new Promise(done=>{let i=0,live=0;const next=()=>{if(i>=list.length&&!live)return done();
  while(live<n&&i<list.length){const [name,file]=list[i++],t0=Date.now();live++;let so='',se='';
    const c=spawn('node',[file],{cwd:path.dirname(file),env:process.env});const kill=setTimeout(()=>c.kill('SIGKILL'),600000);
    c.stdout.on('data',d=>so+=d);c.stderr.on('data',d=>se+=d);c.on('close',code=>{clearTimeout(kill);live--;judge(name,t0,code,so,se);next()})}};next()})}
execFileSync('node',[R+'/tools/imports.js'],{stdio:'inherit'});execFileSync('node',[R+'/tools/build.js'],{stdio:'inherit'});
for(const f of fs.readdirSync(R+'/test/logic').filter(f=>f.endsWith('.test.js')))run('logic/'+f,R+'/test/logic/'+f,quick?['quick']:[],null,f==='story6.test.js'?1200000:600000);   // quick: the story with one class, the full run with all eight
run('sim/battle meadow',R+'/test/sim/battle.js',[],{N:'12'});run('sim/battle gorb',R+'/test/sim/battle.js',[],{N:'6',BOSS:'gorb',LVL:'7'});
run('sim/slice',R+'/test/sim/slice.js',[],{RUNS:'2'});
(async()=>{const T0=Date.now();
  /* slowest first, so the pool finishes together */
  /* tsite starts the real game server and times its socket: it runs on its own */
  if(!quick)await runAll([['browser/tsite',R+'/test/browser/tsite.js']],1);
  if(!quick)await runAll(['tmixed','tnet','tbat2','tmmo','trot','tjoy','trooms','tworld','smoke','hold','tw1','playhero','tsound','tmenu','tchars','tcoop6','ttaps6','tsound6','tart6'].map(t=>['browser/'+t,R+'/test/browser/'+t+'.js']),+process.env.BROWSERS||3);
  const f=results.filter(r=>r[0]==='FAIL').length;console.log('\n'+(f?f+' FAILED':'all '+results.length+' passed')+(quick?'':' · browsers '+((Date.now()-T0)/1000).toFixed(0)+'s'));process.exitCode=f?1:0})();
