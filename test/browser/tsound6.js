/* v6 sound (build step 18): with sound on, the new sounds and the ambient loops play without errors, and the music the page actually
   plays follows the plan: Hearthspire's morning, the bakery's hum with the fire, the tower's fire alone, Pebblebrook without drums
   and then with them once the wheel turns (the mill's creak near the mill). */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html')+'?v6';
(async()=>{const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[],fail=[];
  const p=await br.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>errs.push('pageerror '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_INTERNET|fonts/.test(m.text()))errs.push('console '+m.text())});
  await p.goto(FILE);await p.evaluate(()=>sessionStorage.setItem('kobold-pit-booted','1'));await p.reload();await p.waitForTimeout(300);await p.click('#go-rpg');await p.waitForTimeout(300);
  await p.evaluate(()=>{__v6.pack([['Pip','fighter',5]]);__rp.s.q.act=1;__rp.grace=1e9;__kqA.on();for(const k of ['crack','roar','mine','ember','clack','skree','rhyme','door','fountain','recruit','item','level','spark'])__kqA.sfx(k,1)});
  await p.waitForTimeout(1500);
  const go=async(pl,x,y,q)=>{await p.evaluate(([pl,x,y,q])=>{if(x==null){__w6go(pl,1,1);const t=__v6.find('q');if(t){__rp.s.x=t[0];__rp.s.y=t[1];__rp.pos=null}}else __w6go(pl,x,y);Object.assign(__rp.s.q,q||{});__rp.dlg=null;__rp.mode='map'},[pl,x,y,q]);await p.waitForTimeout(700);return p.evaluate(()=>__kqA.music())};
  let m=await go('hearthspire',5,20);if(m.key!=='hs_morning')fail.push('Hearthspire plays '+m.key);
  m=await go('room:bakery');if(m.key!=='hum'||m.amb!=='fire')fail.push('the bakery plays '+m.key+'/'+m.amb);
  m=await go('room:tower');if(m.key!=='quiet'||m.amb!=='fire')fail.push('the tower plays '+m.key+'/'+m.amb);
  m=await go('pebblebrook',5,5,{act:7,pb:2});if(m.key!=='pebble')fail.push('Pebblebrook before the wheel plays '+m.key);
  const mill=await p.evaluate(()=>__v6.mill);m=await go('pebblebrook',mill[0],mill[1]+1,{pb:6});if(m.key!=='pebble_wheel'||m.amb!=='wheel')fail.push('the wheel turns: '+m.key+'/'+m.amb);
  await p.waitForTimeout(2000);
  console.log('v6 tunes '+(fail.length?fail.join('; '):'ok'),'errors',JSON.stringify(errs.slice(0,3)));await br.close();process.exitCode=(errs.length||fail.length)?1:0})();
