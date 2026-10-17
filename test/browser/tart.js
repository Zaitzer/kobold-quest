/* Drawings in the real page: the test build carries two test drawings (test/fixtures/art), Pip and the grass tile.
   They load, Pip is drawn from his drawing on the map and in battle, and the grass tile replaces the drawn grass. */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html'),OUT=path.join(__dirname,'../out');
const SAVE=JSON.parse(fs.readFileSync(path.join(__dirname,'../fixtures/save_v2.json'),'utf8'));
(async()=>{const br=await chromium.launch();const errs=[];let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
 const ctx=await br.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(s=>{localStorage.setItem('kobold-pit-rpg',s);sessionStorage.setItem('kobold-pit-booted','1')},JSON.stringify(SAVE));
 await p.goto(FILE);await p.click('#go-rpg');await p.waitForTimeout(700);await p.evaluate(()=>{__rp.grace=1e9;__rp.encRate=0;const r=__rp;r.s.x=17;r.s.y=23;r.pos=null});await p.waitForTimeout(400);
 const s=await p.evaluate(()=>{const a=__kq.sprite('pip'),t=__kq.sprite('tile-grass');return{pip:a&&[a.w,a.h,Math.round(a.feet)],tile:t&&[t.w,t.h],none:!!__kq.sprite('elder')}});
 if(!s.pip||s.pip[0]!==128||Math.abs(s.pip[2]-111)>2)bad('pip drawing not loaded right: '+JSON.stringify(s));if(!s.tile)bad('grass tile drawing not loaded');if(s.none)bad('a drawing that does not exist reported as loaded');
 // the middle of the screen is Pip: it should be pink (the test drawing), not orange
 await p.screenshot({path:OUT+'/art_map.png'});
 const px=await p.evaluate(()=>{const c=document.querySelector('#v-rpg canvas');const g=c.getContext('2d');const d=g.getImageData(c.width/2,c.height/2-16,1,1).data;return[d[0],d[1],d[2]]});
 if(!(px[0]>200&&px[1]<140&&px[2]>150&&px[2]<255))bad('Pip is not drawn from his drawing (pixel '+px+')');
 // and the grass is the pink test tile
 const gr=await p.evaluate(()=>{const c=document.querySelector('#v-rpg canvas');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=16)if(Math.abs(d[i]-250)<8&&Math.abs(d[i+1]-120)<8&&Math.abs(d[i+2]-200)<8)n++;return Math.round(n/(d.length/16)*100)});
 if(gr<10)bad('grass tile drawing not on the map ('+gr+'% pink)');
 console.log('map: pip pixel',px.join(','),'· grass tile covers',gr+'% of the screen');
 await p.evaluate(()=>__rpB.battle(['scout'],{zone:','}));await p.waitForTimeout(800);await p.screenshot({path:OUT+'/art_battle.png'});
 await br.close();console.log(errs.length?'errors '+JSON.stringify(errs):'errors []');console.log(fails?'FAIL':'art ok');process.exitCode=fails||errs.length?1:0})();
