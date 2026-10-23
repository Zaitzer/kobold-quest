/* The map editor (tools/editor): it opens a copy of the repo's world (through a stand-in for the browser's folder access), shows every
   place with no problems, paints and undoes, makes a link and its way back, makes a new map, scripts a scene with a line picked from the
   script, catches a broken anchor, and saves files that tools/world/world.js reads back with no problems. */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),os=require('os');
const R=path.join(__dirname,'../..'),KW=require(R+'/tools/world/world.js');
const T=fs.mkdtempSync(path.join(os.tmpdir(),'kqed-'));
for(const d of ['world','docs','src/data/v6'])fs.mkdirSync(path.join(T,d),{recursive:true});
fs.cpSync(R+'/world',T+'/world',{recursive:true});fs.copyFileSync(R+'/docs/slice-dialogue.md',T+'/docs/slice-dialogue.md');fs.copyFileSync(R+'/src/data/v6/foes.js',T+'/src/data/v6/foes.js');
fs.cpSync(R+'/art',T+'/art',{recursive:true});
const bad=[],check=(ok,msg)=>{console.log((ok?'ok ':'FAIL ')+msg);if(!ok)bad.push(msg)};
(async()=>{const br=await chromium.launch(),p=await br.newPage({viewport:{width:1400,height:900}}),errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  const safe=f=>{const a=path.resolve(T,f);if(!a.startsWith(T))throw new Error('outside');return a};
  await p.exposeBinding('__fsRead',(s,f)=>{try{return fs.readFileSync(safe(f),'utf8')}catch(e){return null}});
  await p.exposeBinding('__fsBlob',(s,f)=>{try{return fs.readFileSync(safe(f)).toString('base64')}catch(e){return null}});
  await p.exposeBinding('__fsWrite',(s,f,t)=>{fs.mkdirSync(path.dirname(safe(f)),{recursive:true});fs.writeFileSync(safe(f),t)});
  await p.exposeBinding('__fsRemove',(s,f)=>{try{fs.unlinkSync(safe(f))}catch(e){}});
  await p.exposeBinding('__fsWalk',(s,d)=>{const out=[],go=(rel)=>{for(const e of fs.readdirSync(safe(rel),{withFileTypes:true}))e.isDirectory()?go(rel+'/'+e.name):out.push(rel+'/'+e.name)};try{go(d)}catch(e){}return out.sort()});
  await p.exposeBinding('__fsList',(s,d)=>{try{return fs.readdirSync(safe(d)).sort()}catch(e){return[]}});
  await p.addInitScript(()=>{window.__kqFs={name:'kobold-quest',read:f=>window.__fsRead(f),write:(f,t)=>window.__fsWrite(f,t),remove:f=>window.__fsRemove(f),list:d=>window.__fsList(d),walk:d=>window.__fsWalk(d),
    blob:async f=>{const b=await window.__fsBlob(f);return b?new Blob([Uint8Array.from(atob(b),c=>c.charCodeAt(0))],{type:'image/png'}):null}};window.confirm=()=>true;window.alert=m=>{window.__alerts=(window.__alerts||[]).concat([m])}});
  await p.goto('file://'+R+'/tools/editor/index.html');await p.waitForTimeout(1200);
  const st=()=>p.evaluate(()=>{const E=window.KQEditor;return{places:Object.keys(E.W.places).length,problems:E.check.problems.map(x=>x.where+': '+x.msg),cur:E.cur,
    welcome:getComputedStyle(document.querySelector('#welcome')).display,status:document.querySelector('#status').textContent}});
  let s=await st();check(s.welcome==='none'&&s.places===14,'the editor opens the world: '+s.places+' places');
  check(!s.problems.length,'the world as it is has no problems '+JSON.stringify(s.problems).slice(0,300));
  check(/all saved/.test(s.status),'nothing to save yet: '+s.status);
  await p.waitForTimeout(800);
  const art=await p.evaluate(()=>({n:Object.keys(KQEditor.artIndex||{}).length,grass:!!KQEditor.art.grass,mallow:!!KQEditor.art.mallow||!!KQEditor.art.bib}));
  check(art.n>150&&art.grass&&art.mallow,'the pixel art is found and drawn (tiles and people): '+JSON.stringify(art));
  await p.screenshot({path:R+'/test/out/editor_open.png'});
  /* paint a tile with the mouse, then undo and redo */
  const tileXY=(x,y)=>p.evaluate(([x,y])=>{const E=window.KQEditor,r=document.querySelector('#cv').getBoundingClientRect();return[r.left+E.ox+(x+.5)*E.zoom,r.top+E.oy+(y+.5)*E.zoom]},[x,y]);
  const at=(x,y)=>p.evaluate(([x,y])=>window.KQEditor.W.places[window.KQEditor.cur].rows[y][x],[x,y]);
  await p.click('#pal button[title^=\'"~"\']');let [cx,cy]=await tileXY(5,2);await p.mouse.click(cx,cy);
  check(await at(5,2)==='~','painting puts water on the map');
  await p.click('#undo');check(await at(5,2)!=='~','undo takes it back');await p.click('#redo');check(await at(5,2)==='~','redo puts it again');
  await p.click('#undo');
  /* select a tile and add a link with its way back */
  await p.click('#tools button:has-text("Select")');[cx,cy]=await tileXY(3,1);await p.mouse.click(cx,cy);
  await p.click('#panel button:has-text("+ Link")');
  const linkCard=p.locator('#panel .card').filter({hasText:'shut way'});
  await linkCard.locator('select').first().selectOption('room:inn');
  await p.evaluate(()=>{const E=window.KQEditor,l=E.W.places.hearthspire.links.find(l=>l.x===3&&l.y===1);KQEd.change(()=>{l.tx=5;l.ty=6;delete l.flag})});await p.waitForTimeout(400);
  s=await st();check(s.problems.some(x=>/3,1 → room:inn has no way back/.test(x)),'a link with no way back is a problem');
  await p.click('#panel button:has-text("Make the way back")');await p.waitForTimeout(400);
  s=await st();check(!s.problems.some(x=>/no way back/.test(x)),'"Make the way back" fixes it');
  /* a new map through the dialog */
  await p.click('#newplace');await p.fill('#nid','testmeadow');await p.fill('#nt','A test meadow');await p.fill('#nw','12');await p.fill('#nh','8');await p.click('#dlgbox button:has-text("Make it")');
  s=await st();check(s.cur==='testmeadow'&&s.places===15,'a new map is made and opened');
  /* a scene with a line picked from the script, then a broken anchor */
  await p.evaluate(()=>KQEd.change(()=>{const P=KQEditor.W.places.testmeadow;P.npcs.push({id:'tester',n:'Tester',x:4,y:4,colour:'#ff8800'});KQEditor.W.scenes.scenes.push({id:'t1',from:'1.1',at:{place:'testmeadow',npc:'tester'},when:{act:1},steps:[['say']]});KQEditor.scene='t1';KQEditor.tab='scenes'}));
  await p.locator('#panel .ln').nth(2).click();
  const st1=await p.evaluate(()=>KQEditor.W.scenes.scenes.find(s=>s.id==='t1').steps[0]);
  check(typeof st1[1]==='string'&&st1[1].length>3,'clicking a line sets where the scene starts: "'+st1[1]+'"');
  await p.evaluate(()=>KQEd.change(()=>{KQEditor.W.scenes.scenes.find(s=>s.id==='t1').steps[0][1]='these words are in no line'}));await p.waitForTimeout(400);
  s=await st();check(s.problems.some(x=>/scene t1/.test(x)),'a line that is not in the script is a problem');
  await p.evaluate(()=>KQEd.change(()=>{KQEditor.W.scenes.scenes.find(s=>s.id==='t1').steps[0][1]=null}));await p.waitForTimeout(400);
  /* the new map needs a way in: link the test link's target... a gate from Hearthspire's west gate area */
  await p.evaluate(()=>KQEd.change(()=>{const P=KQEditor.W.places.testmeadow,H=KQEditor.W.places.hearthspire;P.links.push({x:1,y:1,to:'hearthspire',tx:5,ty:2,how:'step'});H.links.push({x:5,y:2,to:'testmeadow',tx:1,ty:1,how:'step'})}));
  await p.waitForTimeout(400);s=await st();check(!s.problems.length,'no problems before saving '+JSON.stringify(s.problems).slice(0,300));
  await p.screenshot({path:R+'/test/out/editor_scene.png'});
  await p.keyboard.press('Control+s');await p.waitForTimeout(800);
  s=await st();check(/all saved/.test(s.status),'saved: '+s.status);
  check(fs.existsSync(T+'/world/maps/testmeadow.json'),'the new map is a file in world/maps');
  const W=KW.load(T),r=KW.check(W,{script:KW.parseScript(fs.readFileSync(T+'/docs/slice-dialogue.md','utf8'))});
  check(!r.problems.length&&W.places.testmeadow&&W.scenes.scenes.some(s=>s.id==='t1'),'the saved world reads back with no problems '+JSON.stringify(r.problems).slice(0,200));
  const txt=fs.readFileSync(T+'/world/maps/testmeadow.json','utf8');check(txt===KW.format(KW.placeFile(W.places.testmeadow))+'\n','files are written in the one format');
  const untouched=fs.readFileSync(T+'/world/maps/mine2.json','utf8')===fs.readFileSync(R+'/world/maps/mine2.json','utf8');check(untouched,'places that were not edited are not rewritten');
  check(!errs.length,'no page errors '+JSON.stringify(errs).slice(0,300));
  await br.close();fs.rmSync(T,{recursive:true,force:true});process.exitCode=bad.length?1:0})();
