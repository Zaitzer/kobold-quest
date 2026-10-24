/* the heroes screen (build step 14): Play opens six slots; a new hero is named, picks a class and buys its scores (systems.md §16:
   Begin waits until the points are spent) and begins the story as that class; after a reload the slot shows
   the hero and plays it again; no page errors. Runs the test build with ?v6 (the old scenarios keep the first story's title). */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html')+'?v6';
(async()=>{const br=await chromium.launch();const errs=[];const out=[];
 const ctx=await br.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push('console '+m.text().slice(0,160))});
 await p.goto(FILE);await p.evaluate(()=>sessionStorage.setItem('kobold-pit-booted','1'));await p.reload();await p.waitForTimeout(300);
 await p.click('#go-rpg');await p.waitForTimeout(600);out.push('select '+await p.evaluate(()=>window.__rp.mode));
 await p.screenshot({path:__dirname+'/../out/chars_select.png'});
 await p.click('[data-rp="c6new"][data-v="0"]');await p.waitForTimeout(300);await p.fill('#c6-new','Tansy');
 await p.click('[data-rp="c6cls"][data-v="ranger"]');await p.waitForTimeout(200);await p.screenshot({path:__dirname+'/../out/chars_new.png'});await p.click('[data-rp="c6next"]');await p.waitForTimeout(200);
 /* buy: DEX to 15 (9), WIS 14 (7), CON 13 (5), STR 12 (4), INT 10 (2): 27 */
 for(const [k,n] of [['DEX',7],['WIS',6],['CON',5],['STR',4],['INT',2]])for(let i=0;i<n;i++){await p.click('[data-rp="c6sc"][data-v="'+k+'"][data-d="1"]');await p.waitForTimeout(30)}
 const buy=await p.evaluate(()=>[document.querySelector('[data-rp="c6make"]').disabled,document.querySelector('[data-rp="c6sc"][data-v="CHA"][data-d="1"]').disabled]);out.push('bought '+buy.join(','));
 await p.screenshot({path:__dirname+'/../out/chars_scores.png'});
 await p.click('[data-rp="c6make"]');await p.waitForTimeout(500);
 for(let i=0;i<20;i++){const m=await p.evaluate(()=>window.__rp.mode);if(m!=='dialog')break;await p.click('[data-rp="next"]');await p.waitForTimeout(60)}
 out.push('story '+await p.evaluate(()=>window.__rp.mode+' '+window.__rp.s.w6+' '+window.__rp.s.hero.name+' '+window.__rp.s.party[0].cls+' '+window.__rp.s.party[0].scores.DEX));
 await p.evaluate(()=>{window.__rp.s.gold=55;window.__rpS()});await p.waitForTimeout(300);
 await p.reload();await p.waitForTimeout(400);await p.click('#go-rpg');await p.waitForTimeout(600);
 const label=await p.evaluate(()=>{const b=document.querySelector('[data-rp="c6play"][data-v="0"]');return b?b.textContent:''});out.push('slot '+label.slice(0,40));
 await p.click('[data-rp="c6play"][data-v="0"]');await p.waitForTimeout(500);out.push('played '+await p.evaluate(()=>window.__rp.mode+' '+window.__rp.s.gold));
 await p.screenshot({path:__dirname+'/../out/chars_play.png'});
 /* a desktop window: the heroes screen fills it (desktop.css once pushed it half off the screen) */
 {const d=await br.newPage({viewport:{width:1918,height:1000}});await d.goto(FILE);await d.evaluate(()=>sessionStorage.setItem('kobold-pit-booted','1'));await d.reload();await d.waitForTimeout(300);
  await d.click('#go-rpg');await d.waitForTimeout(500);const r=await d.evaluate(()=>{const b=document.getElementById('rp-panel').getBoundingClientRect();return[b.x,b.y,b.width,b.height]});
  out.push('desktop '+r.join(','));await d.screenshot({path:__dirname+'/../out/chars_desktop.png'});await d.close()}
 const good=out.some(o=>o==='desktop 0,0,1918,1000')&&out[0]==='select c6'&&out[1]==='bought false,true'&&/^story map room:bakery Tansy ranger 15/.test(out[2])&&/Tansy/.test(out[3])&&out[4]==='played map 55';
 console.log(out.join(' | '),good?'ok':'WRONG','errors',JSON.stringify(errs));await br.close();process.exitCode=good&&!errs.length?0:1})();
