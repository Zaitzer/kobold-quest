/* Rooms in the real page: walk up to each door, go in, look around, walk out again (phone sideways and upright). */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html'),OUT=path.join(__dirname,'../out');
const SAVE=JSON.parse(fs.readFileSync(path.join(__dirname,'../fixtures/save_v2.json'),'utf8'));
const DOORS={inn:[3,20],shop:[11,20],elder:[4,26],hut:[8,4]};
(async()=>{const br=await chromium.launch();const errs=[];let fails=0;
 for(const vp of [{n:'land',width:844,height:390},{n:'port',width:390,height:844}]){
  const ctx=await br.newContext({viewport:{width:vp.width,height:vp.height},hasTouch:true,isMobile:true});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))errs.push(m.text())});
  await p.addInitScript(s=>{localStorage.setItem('kobold-pit-rpg',s);sessionStorage.setItem('kobold-pit-booted','1')},JSON.stringify(SAVE));
  await p.goto(FILE);await p.click('#go-rpg');await p.waitForTimeout(500);await p.evaluate(()=>{__rp.grace=1e9;__rp.encRate=0});
  for(const [id,[dx,dy]] of Object.entries(DOORS)){
    await p.evaluate(([x,y])=>{const r=__rp;r.mode='map';r.s.x=x;r.s.y=y+1;r.s.face='up';r.pos=null},[dx,dy]);await p.waitForTimeout(150);
    await p.keyboard.press('e');await p.waitForTimeout(500);
    const inside=await p.evaluate(()=>__rp.s.place);if(inside!==id){fails++;console.log('FAIL',vp.n,'door did not lead into',id,'got',inside)}
    if(vp.n==='land'||id==='inn')await p.screenshot({path:OUT+'/room_'+id+'_'+vp.n+'.png'});
    await p.keyboard.down('ArrowDown');for(let i=0;i<40&&await p.evaluate(()=>!!__rp.s.place);i++)await p.waitForTimeout(100);await p.keyboard.up('ArrowDown');
    const out=await p.evaluate(()=>[__rp.s.place||'world',__rp.s.x,__rp.s.y]);
    if(out[0]!=='world'){fails++;console.log('FAIL',vp.n,'could not walk out of',id,out)}else console.log(vp.n,id,'in and out ok, outside at',out[1]+','+out[2])}
  await ctx.close()}
 await br.close();console.log(errs.length?'errors '+JSON.stringify(errs):'errors []');console.log(fails?'FAIL':'all rooms ok');process.exitCode=fails||errs.length?1:0})();
