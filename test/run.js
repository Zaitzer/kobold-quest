/* The whole test suite: `node test/run.js` (add `quick` to skip the browser scenarios).
   1 build · 2 logic tests in Node (parity with v37, saves, wiring) · 3 a balance sim · 4 browser scenarios at phone and desktop sizes,
   including two- and three-player online play over a mocked room and database. */
const {execFileSync,spawnSync}=require('child_process');const path=require('path'),fs=require('fs');
const R=path.join(__dirname,'..');const quick=process.argv.includes('quick');
const results=[];
function run(name,file,args,env,timeout){const t0=Date.now();
  const r=spawnSync('node',[file].concat(args||[]),{cwd:path.dirname(file),env:Object.assign({},process.env,env||{}),encoding:'utf8',timeout:timeout||600000});
  const out=((r.stdout||'')+(r.stderr||'')).split('\n').filter(l=>l&&!/agent-proxy|fonts\.googleapis|Allowed hosts|For details|^- |ERR_TUNNEL|Failed to load resource/.test(l));
  const bad=r.status!==0||out.some(l=>/Error|FAIL|errors \[ *'[^\]]*[^' \]]/.test(l)&&!/errors \[ *('')? *\]/.test(l));
  results.push([bad?'FAIL':'ok  ',name,((Date.now()-t0)/1000).toFixed(0)+'s',(bad?out.filter(l=>/Error|FAIL|errors/.test(l)).slice(0,3).join(' | '):out[out.length-1]||'').slice(0,160)]);
  console.log(results[results.length-1].join('  '))}
execFileSync('node',[R+'/tools/imports.js'],{stdio:'inherit'});execFileSync('node',[R+'/tools/build.js'],{stdio:'inherit'});
for(const f of fs.readdirSync(R+'/test/logic').filter(f=>f.endsWith('.test.js')))run('logic/'+f,R+'/test/logic/'+f);
run('sim/battle meadow',R+'/test/sim/battle.js',[],{N:'12'});run('sim/battle gorb',R+'/test/sim/battle.js',[],{N:'6',BOSS:'gorb',LVL:'7'});
if(!quick)for(const t of ['smoke','tjoy','hold','trot','tbat2','tw1','playhero','tmenu','tnet','tmmo','tmixed','tsite','trooms'])run('browser/'+t,R+'/test/browser/'+t+'.js');
const f=results.filter(r=>r[0]==='FAIL').length;console.log('\n'+(f?f+' FAILED':'all '+results.length+' passed'));process.exitCode=f?1:0;
