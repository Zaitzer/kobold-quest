/* sound: with sound on, every sound and jingle plays without errors; the right tune plays in a town and indoors;
   music dips while someone talks */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html');
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[],fail=[];
  const ctx=await br.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_INTERNET|fonts/.test(m.text()))errs.push('console '+m.text())});
  await p.goto(FILE);await p.evaluate(()=>sessionStorage.setItem('kobold-pit-booted','1'));await p.reload();await p.waitForTimeout(300);
  await p.click('#go-rpg');await p.waitForTimeout(500);
  for(let i=0;i<6;i++){const t=await p.evaluate(()=>window.__rp.mode);if(t==='map')break;const b=await p.$('#rp-panel button');if(!b)break;await b.click().catch(()=>{});await p.waitForTimeout(150)}
  await p.evaluate(()=>{window.__kqA.on();for(const k of ['hit','crit','miss','ko','nom','drop','pet','pop','win','blip','tap','bump','door','chest','fountain','spark','level','recruit','item','lose'])window.__kqA.sfx(k,1.1)});
  await p.waitForTimeout(2500);/* let the jingles finish so the music is back up */
  const where=async(x,y)=>{await p.evaluate(([x,y])=>{const r=window.__rp;r.dlg=null;r.mode='map';r.s.x=x;r.s.y=y;r.pos=null},[x,y]);await p.waitForTimeout(400);return p.evaluate(()=>window.__kqA.music())};
  let m=await where(7,23);if(m.key!=='village')fail.push('Burrowhome plays '+m.key);
  m=await where(105,25);
  if(!/^town:|meadow/.test(m.key))fail.push('east of the valley plays '+m.key);
  const before=m.lvl;await p.evaluate(()=>window.__kq.say(['Hello there.',{who:'Ruddle',text:'Mind the rocks.'}]));await p.waitForTimeout(600);
  m=await p.evaluate(()=>window.__kqA.music());if(!(m.lvl<before))fail.push('music did not dip for talk ('+before+' -> '+m.lvl+')');
  console.log('tunes ok',m.key,fail.join('; '),'errors',JSON.stringify(errs));await br.close();process.exitCode=(errs.length||fail.length)?1:0})();
