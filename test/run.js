/* The test suite. Every test is its own job (one file, one process, nothing shared but the build), so any one can run alone and
   all of them run side by side, slowest first.
     node test/run.js              the logic tests, the battle sims and the browser scenarios; the story with two classes (fighter, wizard)
     node test/run.js full         the same, the story with all eight classes, and the old slice sim: before a release
     node test/run.js quick        no browsers, the story with one class (fine for logic-only changes)
     node test/run.js coop6 tart6  only the jobs whose names contain one of the words (the build still runs first)
   JOBS=n sets how many run at once (default: two per CPU, at least 4). Times are kept in test/out/times.json to order the next run.
   tsite starts the real game server and times its socket, so it runs on its own, after the others. */
const {execFileSync,spawn}=require('child_process');const path=require('path'),fs=require('fs'),os=require('os');
const R=path.join(__dirname,'..'),args=process.argv.slice(2),quick=args.includes('quick'),full=args.includes('full'),words=args.filter(a=>a!=='quick'&&a!=='full');
const TIMES=R+'/test/out/times.json';let times={};try{times=JSON.parse(fs.readFileSync(TIMES,'utf8'))}catch(e){}
const results=[];
function judge(name,t0,status,stdout,stderr){
  const out=((stdout||'')+(stderr||'')).split('\n').filter(l=>l&&!/agent-proxy|fonts\.googleapis|Allowed hosts|Allowed domains|For details|^- |ERR_TUNNEL|Failed to load resource/.test(l));
  const bad=status!==0||out.some(l=>/Error|FAIL|errors \[ *'[^\]]*[^' \]]/.test(l)&&!/errors \[ *('')? *\]/.test(l));
  const secs=(Date.now()-t0)/1000;times[name]=Math.round(secs);
  results.push([bad?'FAIL':'ok  ',name,secs.toFixed(0)+'s',(bad?out.filter(l=>/Error|FAIL|errors/.test(l)).slice(0,3).join(' | '):out[out.length-1]||'').slice(0,160)]);
  console.log(results[results.length-1].join('  '))}
/* run jobs [name, file, args, env] n at a time */
function pool(list,n){return new Promise(done=>{let i=0,live=0;const next=()=>{if(i>=list.length&&!live)return done();
  while(live<n&&i<list.length){const [name,file,a,env]=list[i++],t0=Date.now();live++;let so='',se='';
    const c=spawn('node',[file].concat(a||[]),{cwd:path.dirname(file),env:Object.assign({},process.env,env||{})});const kill=setTimeout(()=>c.kill('SIGKILL'),900000);
    c.stdout.on('data',d=>so+=d);c.stderr.on('data',d=>se+=d);c.on('close',code=>{clearTimeout(kill);live--;judge(name,t0,code,so,se);next()})}};next()})}
/* the jobs */
const jobs=[];
for(const f of fs.readdirSync(R+'/test/logic').filter(f=>f.endsWith('.test.js')).sort()){
  if(f==='story6.test.js'){for(const cls of quick?['fighter']:full?['fighter','ranger','wizard','cleric','monk','sorcerer','bard','rogue']:['fighter','wizard'])jobs.push(['logic/story6 '+cls,R+'/test/logic/'+f,[cls]]);continue}
  jobs.push(['logic/'+f.slice(0,-8),R+'/test/logic/'+f,quick?['quick']:[]])}
jobs.push(['sim/battle meadow',R+'/test/sim/battle.js',[],{N:'12'}],['sim/battle gorb',R+'/test/sim/battle.js',[],{N:'6',BOSS:'gorb',LVL:'7'}]);
if(full)jobs.push(['sim/slice',R+'/test/sim/slice.js',[],{RUNS:'2'}]);   /* the old game's slice, played by the AI: a minute and a half */
if(!quick)for(const f of fs.readdirSync(R+'/test/browser').filter(f=>f.endsWith('.js')&&!['netmock.js','states.js','styles.js'].includes(f))   /* helpers and tools, not tests */.sort())jobs.push(['browser/'+f.slice(0,-3),R+'/test/browser/'+f]);
const pick=j=>!words.length||words.some(w=>j[0].includes(w));
const solo=jobs.filter(j=>j[0]==='browser/tsite'&&pick(j)),rest=jobs.filter(j=>j[0]!=='browser/tsite'&&pick(j)).sort((a,b)=>(times[b[0]]||30)-(times[a[0]]||30));
(async()=>{const T0=Date.now();
  execFileSync('node',[R+'/tools/imports.js'],{stdio:'inherit'});execFileSync('node',[R+'/tools/build.js'],{stdio:'inherit'});
  await pool(rest,+process.env.JOBS||Math.max(4,os.cpus().length*2));
  if(solo.length)await pool(solo,1);
  /* the QA map (test/qa.js): each row of systems.md §0 and the tests that cover it */
  if(!words.length){const QA=require(R+'/test/qa.js'),have=new Set([...fs.readdirSync(R+'/test/logic').filter(f=>f.endsWith('.test.js')).map(f=>'logic/'+f.slice(0,-8)),...fs.readdirSync(R+'/test/browser').filter(f=>f.endsWith('.js')).map(f=>'browser/'+f.slice(0,-3))]);
   const bad=QA.filter(([n,what,ts])=>!ts.length||ts.some(t=>!have.has(t)));console.log('\nQA: '+QA.length+' systems (systems.md §0), each with its tests'+(bad.length?'; MISSING: '+bad.map(b=>b[0]+' '+b[1]).join(', '):''));
   if(bad.length)results.push(['FAIL','qa map'])}
  try{fs.mkdirSync(R+'/test/out',{recursive:true});fs.writeFileSync(TIMES,JSON.stringify(times,null,1))}catch(e){}
  const f=results.filter(r=>r[0]==='FAIL').length;console.log('\n'+(f?f+' FAILED':'all '+results.length+' passed')+' · '+((Date.now()-T0)/1000).toFixed(0)+'s');process.exitCode=f?1:0})();
