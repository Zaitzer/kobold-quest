/* The big world in the real page: walk out of the valley, look at a few places far away, keep the frame rate up. */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html'),OUT=path.join(__dirname,'../out');
const SAVE=JSON.parse(fs.readFileSync(path.join(__dirname,'../fixtures/save_v2.json'),'utf8'));
(async()=>{const br=await chromium.launch();const errs=[];let fails=0;
 const ctx=await br.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(s=>{localStorage.setItem('kobold-pit-rpg',s);sessionStorage.setItem('kobold-pit-booted','1')},JSON.stringify(SAVE));
 await p.goto(FILE);await p.click('#go-rpg');await p.waitForTimeout(500);await p.evaluate(()=>{__rp.grace=1e9;__rp.encRate=0});
 // walk east along the village road and out of the valley
 await p.evaluate(()=>{const r=__rp;r.s.x=34;r.s.y=22;r.pos=null});await p.waitForTimeout(200);
 await p.keyboard.down('ArrowRight');await p.waitForTimeout(2600);await p.keyboard.up('ArrowRight');
 const out=await p.evaluate(()=>[__rp.s.x,__rp.s.y,document.getElementById('rp-topt').textContent]);
 if(out[0]<41){fails++;console.log('FAIL could not walk out of the valley, at',out)}else console.log('walked out to',out.join(' · '));
 await p.screenshot({path:OUT+'/world_exit.png'});
 // drop in on far places and measure frames
 for(const [x,y,n] of [[640,480,'middle'],[1006,595,'ashvale'],[300,600,'snow'],[1250,900,'coast']]){
   await p.evaluate(([x,y])=>{const r=__rp;r.s.x=x;r.s.y=y;r.pos=null},[x,y]);await p.waitForTimeout(400);
   const fps=await p.evaluate(()=>new Promise(ok=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<1500)requestAnimationFrame(f);else ok(Math.round(n/1.5))};requestAnimationFrame(f)}));
   const area=await p.evaluate(()=>document.getElementById('rp-topt').textContent);
   console.log(n,'at',x+','+y,'·',area,'·',fps,'fps');if(fps<30){fails++;console.log('FAIL slow at',n)}
   await p.screenshot({path:OUT+'/world_'+n+'.png'})}
 await br.close();console.log(errs.length?'errors '+JSON.stringify(errs):'errors []');console.log(fails?'FAIL':'world ok');process.exitCode=fails||errs.length?1:0})();
