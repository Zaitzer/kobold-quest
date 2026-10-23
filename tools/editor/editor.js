/* The Kobold Quest map editor (tools/editor/index.html). It works on the repo folder through the browser's file access (Chrome,
   Edge): it reads world/, docs/slice-dialogue.md (the lines), src/data/v6/foes.js (the bestiary's names) and the tile sheets in
   art/v6/tiles, and writes world/ back on Save. tools/world/world.js formats the files and checks the world as you edit.
   Tests (test/browser/teditor.js) hand it a stand-in folder as window.__kqFs. */
(function(){'use strict';
const KW=window.KQWorld,$=s=>document.querySelector(s);

/* ---------------------------------------------------------------- a tiny DOM helper */
function h(tag,attrs,...kids){const e=document.createElement(tag);let val;
  for(const [k,v] of Object.entries(attrs||{})){if(v==null||v===false)continue;
    if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(k==='value')val=v;else if(k==='class')e.className=v;else if(k==='style')Object.assign(e.style,v);
    else if(k==='checked'||k==='disabled'||k==='selected')e[k]=!!v;else e.setAttribute(k,v===true?'':v)}
  for(const c of kids.flat(9))if(c!=null&&c!==false)e.append(c.nodeType?c:document.createTextNode(String(c)));
  if(val!==undefined)e.value=val;return e}
const opts=(list,cur)=>list.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return h('option',{value:v,selected:String(v)===String(cur)},l)});

/* ---------------------------------------------------------------- the state */
const E={fs:null,W:null,disk:{},script:{},foes:[],bosses:[],places6:[],cur:null,tool:'select',letter:'.',brush:1,zoom:24,ox:20,oy:20,sel:null,
  layers:{grid:true,art:true,links:true,marks:true,people:true,chests:true,patrols:true,scenes:true,letters:false},undo:[],redo:[],pick:null,tab:'here',
  scene:null,sceneFilter:'here',art:{},check:{problems:[],notes:[],report:[]},drag:null,hover:null,stroke:null};
const THEMES=['meadow','cave','dark','town','flooded'];
const place=()=>E.W.places[E.cur];
const legend=()=>E.W.tiles[place().kind];

/* ---------------------------------------------------------------- the folder: the browser's directory handle, or a test's stand-in */
function dirFs(root){
  const dirOf=async(parts,create)=>{let d=root;for(const p of parts)d=await d.getDirectoryHandle(p,{create});return d};
  const split=p=>{const a=p.split('/');return[a.slice(0,-1),a[a.length-1]]};
  return{name:root.name,
    async read(p){try{const [ds,n]=split(p);const f=await (await (await dirOf(ds,false)).getFileHandle(n)).getFile();return await f.text()}catch(e){return null}},
    async blob(p){try{const [ds,n]=split(p);return await (await (await dirOf(ds,false)).getFileHandle(n)).getFile()}catch(e){return null}},
    async write(p,t){const [ds,n]=split(p);const fh=await (await dirOf(ds,true)).getFileHandle(n,{create:true});const w=await fh.createWritable();await w.write(t);await w.close()},
    async remove(p){try{const [ds,n]=split(p);await (await dirOf(ds,false)).removeEntry(n)}catch(e){}},
    async list(dir){const out=[];try{const d=await dirOf(dir.split('/'),false);for await(const [n,hd] of d.entries())if(hd.kind==='file')out.push(n)}catch(e){}return out.sort()}}}
/* the last folder, kept in the browser so the next visit is one tap */
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('kq-editor',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function idbGet(k){try{const db=await idb();return await new Promise(ok=>{const q=db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>ok(q.result);q.onerror=()=>ok(null)})}catch(e){return null}}
async function idbSet(k,v){try{const db=await idb();db.transaction('kv','readwrite').objectStore('kv').put(v,k)}catch(e){}}

async function openFs(fs){E.fs=fs;
  if(!await fs.read('world/tiles.json'))throw new Error('That folder has no world/tiles.json. Choose the kobold-quest folder itself (the one with world, src and docs in it).');
  await loadAll();$('#welcome').style.display='none';setup();}
async function loadAll(){const fs=E.fs,W={tiles:JSON.parse(await fs.read('world/tiles.json')),scenes:JSON.parse(await fs.read('world/scenes.json')),places:{}};
  E.disk={};
  for(const [dir,kind] of [['maps','map'],['rooms','room']])for(const n of await fs.list('world/'+dir)){if(!n.endsWith('.json'))continue;
    const P=JSON.parse(await fs.read('world/'+dir+'/'+n));P.kind=kind;W.places[KW.gameId(P)]=P}
  E.W=W;Object.assign(E.disk,filesNow());
  E.script=KW.parseScript(await fs.read('docs/slice-dialogue.md')||'');
  const ft=await fs.read('src/data/v6/foes.js')||'',grab=n=>{const m=ft.match(new RegExp('export const '+n+'=(.*?);\\n'));try{return m?JSON.parse(m[1]):null}catch(e){return null}};
  E.foes=Object.keys(grab('FOES6')||{});E.bosses=Object.keys(grab('BOSSES6')||{});E.places6=(grab('PLACES6')||[]).map(p=>p.place);
  E.cur=E.cur&&W.places[E.cur]?E.cur:(W.places.hearthspire?'hearthspire':Object.keys(W.places)[0]);
  loadArt()}
async function loadArt(){E.art={};const seen=new Set();for(const kind of ['map','room'])for(const t of Object.values(E.W.tiles[kind]||{}))if(t.sheet&&!seen.has(t.sheet)){seen.add(t.sheet);
  const b=await E.fs.blob('art/v6/tiles/'+t.sheet+'.png');if(b)try{E.art[t.sheet]=await createImageBitmap(b)}catch(e){}}draw()}

/* ---------------------------------------------------------------- files, saving, undo */
function filesNow(){const o={'world/tiles.json':KW.format(E.W.tiles)+'\n','world/scenes.json':KW.format(E.W.scenes)+'\n'};
  for(const P of Object.values(E.W.places))o['world/'+KW.fileOf(P)]=KW.format(KW.placeFile(P))+'\n';return o}
function changed(){const now=filesNow(),list=[];for(const [p,t] of Object.entries(now))if(E.disk[p]!==t)list.push(p);for(const p of Object.keys(E.disk))if(!(p in now))list.push(p);return{now,list}}
async function save(){const {now,list}=changed();if(!list.length){status('Nothing to save.');return}
  if(E.check.problems.length&&!confirm(E.check.problems.length+' problem(s) in the world (see Problems). The game won\'t update until they are fixed. Save anyway?'))return;
  for(const p of list){if(p in now){await E.fs.write(p,now[p]);E.disk[p]=now[p]}else{await E.fs.remove(p);delete E.disk[p]}}
  status('Saved '+list.length+' file'+(list.length>1?'s':'')+'. Commit and push them with GitHub Desktop.')}
const snap=()=>JSON.stringify({t:E.W.tiles,s:E.W.scenes,p:E.W.places});
function restore(s){const o=JSON.parse(s);E.W.tiles=o.t;E.W.scenes=o.s;E.W.places=o.p;if(!E.W.places[E.cur])E.cur=Object.keys(E.W.places)[0]}
/* every edit goes through here: one undo step, then everything is redrawn and checked */
function change(fn){const b=snap();try{fn()}catch(e){restore(b);alert(e.message);refresh();return false}if(snap()!==b){E.undo.push(b);if(E.undo.length>300)E.undo.shift();E.redo=[]}refresh();return true}
function undo(){if(!E.undo.length)return;E.redo.push(snap());restore(E.undo.pop());refresh()}
function redo(){if(!E.redo.length)return;E.undo.push(snap());restore(E.redo.pop());refresh()}

/* ---------------------------------------------------------------- checks (as you edit) */
let checkT=null;
function recheck(){clearTimeout(checkT);checkT=setTimeout(()=>{E.check=KW.check(E.W,{script:E.script,foes:E.foes.concat(E.bosses),places6:E.places6});tabs();if(E.tab==='problems')panel();status()},250)}
function status(msg){const n=changed().list.length;$('#status').textContent=(msg?msg+' · ':'')+(n?n+' unsaved file'+(n>1?'s':''):'all saved')+' · '+(E.check.problems.length?E.check.problems.length+' problem'+(E.check.problems.length>1?'s':''):'no problems');
  $('#save').disabled=!n}

/* ---------------------------------------------------------------- the map */
const cv=()=>$('#cv');
function fitView(){const P=place(),r=$('#mid').getBoundingClientRect();E.zoom=Math.max(6,Math.min(40,Math.floor(Math.min((r.width-40)/P.w,(r.height-40)/P.h))));E.ox=Math.round((r.width-P.w*E.zoom)/2);E.oy=Math.round((r.height-P.h*E.zoom)/2)}
function tileAt(ev){const r=cv().getBoundingClientRect();return[Math.floor((ev.clientX-r.left-E.ox)/E.zoom),Math.floor((ev.clientY-r.top-E.oy)/E.zoom)]}
const inside=(x,y)=>{const P=place();return x>=0&&y>=0&&x<P.w&&y<P.h};
function draw(){if(!E.W)return;const c=cv(),r=$('#mid').getBoundingClientRect(),dpr=window.devicePixelRatio||1;
  if(c.width!==Math.round(r.width*dpr)||c.height!==Math.round(r.height*dpr)){c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);c.style.width=r.width+'px';c.style.height=r.height+'px'}
  const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.imageSmoothingEnabled=false;g.fillStyle='#0d0712';g.fillRect(0,0,r.width,r.height);
  const P=place(),L=legend(),z=E.zoom,X=x=>E.ox+x*z,Y=y=>E.oy+y*z;
  const x0=Math.max(0,Math.floor(-E.ox/z)),y0=Math.max(0,Math.floor(-E.oy/z)),x1=Math.min(P.w-1,Math.ceil((r.width-E.ox)/z)),y1=Math.min(P.h-1,Math.ceil((r.height-E.oy)/z));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const ch=P.rows[y][x],t=L[ch];
    const art=E.layers.art&&t&&t.sheet&&E.art[t.sheet],under=t&&t.under&&L[t.under];
    g.fillStyle=(art&&under?under.colour:t&&t.colour)||'#ff00ff';g.fillRect(X(x),Y(y),z,z);
    if(art&&under&&under.sheet&&E.art[under.sheet])g.drawImage(E.art[under.sheet],0,0,32,32,X(x),Y(y),z,z);
    if(art)g.drawImage(art,0,0,32,32,X(x),Y(y),z,z);
    else if(t&&t.solid&&z>=10){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(X(x),Y(y)+z*0.78,z,z*0.22)}
    if((E.layers.letters||!t)&&z>=12){g.fillStyle='rgba(0,0,0,.6)';g.font=`700 ${Math.floor(z*0.55)}px ui-monospace,monospace`;g.textAlign='center';g.textBaseline='middle';g.fillText(ch,X(x)+z/2,Y(y)+z/2+1)}}
  if(E.layers.grid&&z>=10){g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1;g.beginPath();for(let x=x0;x<=x1+1;x++){g.moveTo(X(x)+.5,Y(y0));g.lineTo(X(x)+.5,Y(y1+1))}for(let y=y0;y<=y1+1;y++){g.moveTo(X(x0),Y(y)+.5);g.lineTo(X(x1+1),Y(y)+.5)}g.stroke()}
  const label=(t,x,y,col)=>{if(z<14)return;g.font='600 11px system-ui,sans-serif';g.textAlign='center';g.textBaseline='bottom';g.lineWidth=3;g.strokeStyle='rgba(13,7,18,.9)';g.strokeText(t,x,y);g.fillStyle=col||'#fff';g.fillText(t,x,y)};
  const cx=x=>X(x)+z/2,cy=y=>Y(y)+z/2;
  if(P.flood){const [[fx,fy0],[,fy1]]=P.flood;g.fillStyle='rgba(58,143,217,.45)';g.fillRect(X(fx),Y(fy0),z,(fy1-fy0+1)*z)}
  if(E.layers.marks&&P.kind==='map')for(const [x,y] of P.marks||[]){g.fillStyle='rgba(20,10,53,.85)';g.beginPath();g.arc(cx(x),cy(y),Math.max(2,z*0.14),0,7);g.fill()}
  if(P.entry){g.strokeStyle='#7ddc6a';g.lineWidth=2;g.beginPath();g.arc(cx(P.entry[0]),cy(P.entry[1]),z*0.42,0,7);g.stroke();label('start',cx(P.entry[0]),Y(P.entry[1]),'#7ddc6a')}
  for(const [x,y] of P.stables||[]){g.fillStyle='#a8743f';g.beginPath();g.arc(cx(x),cy(y),z*0.3,0,7);g.fill();label('stable',cx(x),Y(y),'#ffd54a')}
  if(E.layers.links)for(const l of P.links||[]){g.lineWidth=2;g.setLineDash(l.flag==='never'?[3,3]:[]);g.strokeStyle=l.flag==='never'?'#9a8aa8':l.flag?'#ffb347':'#ffd54a';g.strokeRect(X(l.x)+1.5,Y(l.y)+1.5,z-3,z-3);g.setLineDash([]);
    label(l.flag==='never'?'shut':'→ '+(l.to||'').replace('room:',''),cx(l.x),Y(l.y),l.flag==='never'?'#b7a9cc':'#ffd54a')}
  if(E.layers.chests)for(const c of P.chests||[])if(c.x!=null){g.fillStyle='#1a0f24';g.fillRect(X(c.x)+z*.18,Y(c.y)+z*.3,z*.64,z*.5);g.fillStyle='#d9a43a';g.fillRect(X(c.x)+z*.24,Y(c.y)+z*.36,z*.52,z*.38)}
  if(E.layers.patrols)for(const p of P.patrols||[]){const f={east:[1,0],west:[-1,0],north:[0,-1],south:[0,1]}[p.face]||[1,0];g.fillStyle='#8a2f4a';g.beginPath();
    g.moveTo(cx(p.x)+f[0]*z*.4,cy(p.y)+f[1]*z*.4);g.lineTo(cx(p.x)-f[0]*z*.3-f[1]*z*.3,cy(p.y)-f[1]*z*.3-f[0]*z*.3);g.lineTo(cx(p.x)-f[0]*z*.3+f[1]*z*.3,cy(p.y)-f[1]*z*.3+f[0]*z*.3);g.fill();label(p.name,cx(p.x),Y(p.y),'#ff9a9a')}
  if(E.layers.people)for(const n of P.npcs||[]){g.lineWidth=2;g.strokeStyle='#1a0f24';g.fillStyle=n.colour||'#e0d0ff';
    if(n.door){g.setLineDash([2,2]);g.strokeStyle='#fff';g.strokeRect(X(n.x)+3,Y(n.y)+3,z-6,z-6);g.setLineDash([])}
    else{g.beginPath();g.arc(cx(n.x),cy(n.y),z*0.36,0,7);g.fill();g.stroke();if(z>=14){g.fillStyle='#1a0f24';g.font=`700 ${Math.floor(z*.42)}px system-ui`;g.textAlign='center';g.textBaseline='middle';g.fillText((n.n||n.id)[0].toUpperCase(),cx(n.x),cy(n.y)+1)}}
    label(n.n||n.id,cx(n.x),Y(n.y),'#fff')}
  if(E.layers.scenes)for(const sc of E.W.scenes.scenes||[]){const a=sc.at||{};if(a.place!==E.cur)continue;const on=E.scene===sc.id;g.strokeStyle=on?'#ffd54a':'#b48cff';g.lineWidth=on?3:1.5;g.setLineDash(on?[]:[5,4]);
    if(a.area||a.bump){const A=a.area||a.bump;g.beginPath();g.arc(X(A[0])+z/2,Y(A[1])+z/2,Math.max(z*.4,A[2]*z),0,7);g.stroke();label('scene '+sc.id,X(A[0])+z/2,Y(A[1])-A[2]*z+z/2,on?'#ffd54a':'#d8c4ff')}
    if(a.tile){g.strokeRect(X(a.tile[0])+2,Y(a.tile[1])+2,z-4,z-4);label('scene '+sc.id,cx(a.tile[0]),Y(a.tile[1]),on?'#ffd54a':'#d8c4ff')}
    if(a.npc){const n=(P.npcs||[]).find(n=>n.id===a.npc);if(n){g.fillStyle=on?'#ffd54a':'#b48cff';g.font=`900 ${Math.max(10,Math.floor(z*.6))}px system-ui`;g.textAlign='left';g.textBaseline='middle';g.fillText('!',X(n.x)+z*.78,Y(n.y)+z*.2)}}
    g.setLineDash([])}
  if(E.sel){g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(X(E.sel[0])-1,Y(E.sel[1])-1,z+2,z+2)}
  if(E.drag&&E.drag.rect){const [a,b,c2,d]=E.drag.rect;g.strokeStyle='#ffd54a';g.lineWidth=2;g.strokeRect(X(Math.min(a,c2)),Y(Math.min(b,d)),(Math.abs(c2-a)+1)*z,(Math.abs(d-b)+1)*z)}
  if(E.hover&&inside(...E.hover)&&E.tool!=='select'&&E.tool!=='hand'){g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1;g.strokeRect(X(E.hover[0])+.5,Y(E.hover[1])+.5,z*E.brush-1,z*E.brush-1)}}

/* ---------------------------------------------------------------- what is on a tile */
function thingsAt(x,y){const P=place(),o=[];
  (P.npcs||[]).forEach(n=>{if(n.x===x&&n.y===y)o.push({k:'npc',v:n})});(P.chests||[]).forEach(c=>{if(c.x===x&&c.y===y)o.push({k:'chest',v:c})});
  (P.patrols||[]).forEach(p=>{if(p.x===x&&p.y===y)o.push({k:'patrol',v:p})});(P.links||[]).forEach(l=>{if(l.x===x&&l.y===y)o.push({k:'link',v:l})});
  if(P.kind==='map')(P.marks||[]).forEach(m=>{if(m[0]===x&&m[1]===y)o.push({k:'mark',v:m})});
  (P.stables||[]).forEach(s=>{if(s[0]===x&&s[1]===y)o.push({k:'stable',v:s})});if(P.entry&&P.entry[0]===x&&P.entry[1]===y)o.push({k:'entry',v:P.entry});return o}
function moveThing(t,x,y){const v=t.v;if(Array.isArray(v)){v[0]=x;v[1]=y}else{v.x=x;v.y=y}}
function setTile(P,x,y,c){if(x<0||y<0||x>=P.w||y>=P.h)return;const r=P.rows[y];if(r[x]!==c)P.rows[y]=r.slice(0,x)+c+r.slice(x+1)}
function paint(x,y){const P=place();for(let j=0;j<E.brush;j++)for(let i=0;i<E.brush;i++)setTile(P,x+i,y+j,E.letter)}
function flood(x,y){const P=place(),from=P.rows[y][x];if(from===E.letter)return;const q=[[x,y]],seen=new Set([x+','+y]);
  while(q.length){const [a,b]=q.pop();setTile(P,a,b,E.letter);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=a+dx,ny=b+dy,k=nx+','+ny;if(!seen.has(k)&&inside(nx,ny)&&P.rows[ny][nx]===from){seen.add(k);q.push([nx,ny])}}}}

function hoverText(x,y){if(!inside(x,y))return'';const P=place(),c=P.rows[y][x],t=legend()[c];const bits=[`${x}, ${y}  "${c}" ${t?t.name+(t.solid?' (solid)':''):'(not a tile!)'}`];
  for(const th of thingsAt(x,y)){const v=th.v;bits.push(th.k==='npc'?'person: '+(v.n||v.id):th.k==='chest'?'chest: '+v.name:th.k==='patrol'?'patrol: '+v.name:th.k==='link'?(v.flag==='never'?'a shut way':'link → '+v.to+' '+v.tx+','+v.ty+(v.flag?' (needs '+JSON.stringify(v.flag)+')':'')):th.k==='mark'?'mark: '+v[2]:th.k==='stable'?'raptor stable':'where the map starts')}
  if(P.kind==='room'){const m=(P.marks||[]).find(m=>m[0]===c);if(m)bits.push(m[1])}
  return bits.join(' · ')}

function bindCanvas(){const c=cv();
  c.addEventListener('contextmenu',e=>e.preventDefault());
  c.addEventListener('pointerdown',e=>{c.setPointerCapture(e.pointerId);const [x,y]=tileAt(e);
    if(e.button===1||e.button===2||E.tool==='hand'||E.space){E.drag={pan:1,sx:e.clientX,sy:e.clientY,ox:E.ox,oy:E.oy};return}
    if(E.pick){const p=E.pick;if(!inside(x,y))return;E.pick=null;$('#pickbar').style.display='none';p.cb(x,y);return}
    if(!inside(x,y))return;
    if(E.tool==='paint'){E.stroke=snap();paint(x,y);E.drag={paint:1};draw()}
    else if(E.tool==='rect')E.drag={rect:[x,y,x,y]};
    else if(E.tool==='fill')change(()=>flood(x,y));
    else if(E.tool==='pick'){E.letter=place().rows[y][x];E.tool='paint';left()}
    else{E.sel=[x,y];const th=thingsAt(x,y)[0];if(th)E.drag={move:th,stroke:snap()};if(E.tab!=='scenes')E.tab='here';tabs();panel();draw()}});
  c.addEventListener('pointermove',e=>{const [x,y]=tileAt(e);E.hover=[x,y];$('#hover').textContent=hoverText(x,y);const d=E.drag;
    if(d&&d.pan){E.ox=d.ox+e.clientX-d.sx;E.oy=d.oy+e.clientY-d.sy}
    else if(d&&d.paint&&inside(x,y))paint(x,y);
    else if(d&&d.rect)d.rect[2]=Math.max(0,Math.min(place().w-1,x)),d.rect[3]=Math.max(0,Math.min(place().h-1,y));
    else if(d&&d.move&&inside(x,y)){moveThing(d.move,x,y);E.sel=[x,y]}
    draw()});
  const up=()=>{const d=E.drag;E.drag=null;if(!d)return;
    if(d.paint||d.move){if(snap()!==(d.stroke||E.stroke)){E.undo.push(d.stroke||E.stroke);E.redo=[]}refresh()}
    else if(d.rect)change(()=>{const [a,b,c2,dd]=d.rect,P=place();for(let y=Math.min(b,dd);y<=Math.max(b,dd);y++)for(let x=Math.min(a,c2);x<=Math.max(a,c2);x++)setTile(P,x,y,E.letter)});
    else draw()};
  c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
  c.addEventListener('pointerleave',()=>{E.hover=null;$('#hover').textContent='';draw()});
  c.addEventListener('wheel',e=>{e.preventDefault();const r=c.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,z0=E.zoom,z=Math.max(4,Math.min(64,Math.round(z0*(e.deltaY<0?1.15:1/1.15))||z0));
    E.ox=Math.round(mx-(mx-E.ox)*z/z0);E.oy=Math.round(my-(my-E.oy)*z/z0);E.zoom=z;draw()},{passive:false});
  window.addEventListener('resize',draw)}
/* the next click on the map picks a tile (on another place when `where` says so; then back to where you were) */
function pickTile(label,cb,where){const from=E.cur;if(where&&E.W.places[where]&&where!==E.cur)goPlace(where);E.pick={cb:(x,y)=>{change(()=>cb(x,y));if(E.cur!==from)goPlace(from)}};const b=$('#pickbar');b.textContent=label+' (Esc to cancel)';b.style.display='block'}

/* ---------------------------------------------------------------- the left side: tools, layers, tiles */
const TOOLS=[['select','Select','V','Select a tile; drag a person, chest, link or mark to move it'],['paint','Paint','B','Paint tiles'],['rect','Rectangle','R','Drag a box of tiles'],
  ['fill','Fill','F','Fill an area of one tile'],['pick','Pick tile','I','Take the tile you click as your brush'],['hand','Move view','H','Drag the view (or drag with the right mouse button)']];
function left(){const T=$('#tools');T.replaceChildren(...TOOLS.map(([k,n,key,tip])=>h('button',{class:E.tool===k?'on':'',title:tip+' ('+key+')',onclick:()=>{E.tool=k;left();draw()}},n)),
    h('select',{title:'Brush size',onchange:e=>{E.brush=+e.target.value},value:E.brush},opts([[1,'brush 1'],[2,'brush 2'],[3,'brush 3']],E.brush)),
    h('button',{title:'Fit the map in the view',onclick:()=>{fitView();draw()}},'Fit view'));
  const Ly=$('#layers');Ly.replaceChildren(...[['grid','grid'],['art','drawn tiles'],['letters','letters'],['links','links (doors, gates)'],['marks','marks'],['people','people'],['chests','chests'],['patrols','patrols'],['scenes','scene triggers']]
    .map(([k,n])=>h('label',{},h('input',{type:'checkbox',checked:E.layers[k],onchange:e=>{E.layers[k]=e.target.checked;draw()}}),' ',n)));
  const L=legend();$('#pal').replaceChildren(...Object.entries(L).map(([c,t])=>h('button',{class:E.letter===c?'on':'',title:'"'+c+'" '+t.name+(t.solid?' (solid)':''),onclick:()=>{E.letter=c;if(E.tool==='select'||E.tool==='hand'||E.tool==='pick')E.tool='paint';left();draw()}},
    h('span',{class:'sw',style:{background:t.colour}},c),h('span',{},t.name+(t.solid?' ▪':'')))),
    h('button',{onclick:()=>{E.tab='tiles';tabs();panel()}},'+ New tile / edit…'))}

/* ---------------------------------------------------------------- the top: places */
function top(){const S=$('#place'),ids=Object.keys(E.W.places).sort((a,b)=>(a.startsWith('room:')-b.startsWith('room:'))||a.localeCompare(b));
  S.replaceChildren(h('optgroup',{label:'Maps'},...ids.filter(i=>!i.startsWith('room:')).map(i=>h('option',{value:i,selected:i===E.cur},E.W.places[i].title+'  ('+i+')'))),
    h('optgroup',{label:'Rooms'},...ids.filter(i=>i.startsWith('room:')).map(i=>h('option',{value:i,selected:i===E.cur},E.W.places[i].title+'  ('+i+')'))));
  $('#undo').disabled=!E.undo.length;$('#redo').disabled=!E.redo.length}
function goPlace(id,x,y){if(!E.W.places[id])return;const was=E.cur;E.cur=id;if(was!==id){fitView();E.sel=null}if(x!=null){E.sel=[x,y];if(E.tab!=='scenes')E.tab='here'}refresh()}

/* ---------------------------------------------------------------- forms */
/* a field that writes obj[key] when it is changed (one undo step); fmt/parse turn the value into text and back */
function field(label,obj,key,o){o=o||{};let el;const commit=v=>change(()=>{const val=o.parse?o.parse(v):v;if(val===undefined||val===''&&o.drop)delete obj[key];else obj[key]=val;if(o.after)o.after(val)});
  const cur=o.fmt?o.fmt(obj[key]):obj[key];
  if(o.type==='check')el=h('input',{type:'checkbox',checked:!!obj[key],onchange:e=>commit(e.target.checked?(o.on!=null?o.on:1):undefined)});
  else if(o.type==='select')el=h('select',{onchange:e=>commit(e.target.value),value:cur==null?'':cur},opts(o.list,cur==null?'':cur));
  else if(o.type==='color')el=h('input',{type:'color',value:cur||'#cccccc',onchange:e=>commit(e.target.value)});
  else if(o.type==='area')el=h('textarea',{value:cur==null?'':cur,onchange:e=>commit(e.target.value)});
  else el=h('input',{type:o.type==='num'?'number':'text',class:o.type==='num'?'n':'',step:o.step||'any',placeholder:o.ph||'',value:cur==null?'':cur,onchange:e=>commit(o.type==='num'?(e.target.value===''?undefined:+e.target.value):e.target.value)});
  if(o.title)el.title=o.title;return h('div',{class:'row'},label?h('label',{},label):null,el,o.extra||null)}
const num=(label,obj,key,o)=>field(label,obj,key,Object.assign({type:'num'},o||{}));
/* flags as words: "act >= 2, goat = 0" (an "any" or anything else stays JSON) */
const OPW={gte:'>=',lte:'<=',ne:'!=',gt:'>',lt:'<'},WOP={'>=':'gte','<=':'lte','!=':'ne','>':'gt','<':'lt'};
function flagsText(w){if(w==null)return'';if(typeof w!=='object'||w.any)return JSON.stringify(w);
  return Object.entries(w).map(([k,v])=>typeof v==='object'?Object.entries(v).map(([op,n])=>k+' '+OPW[op]+' '+n).join(', '):k+' = '+v).join(', ')}
function textFlags(t){t=String(t||'').trim();if(!t)return undefined;if(t[0]==='{')return JSON.parse(t);const o={};
  for(const part of t.split(',')){const m=part.trim().match(/^([A-Za-z_][\w.]*)\s*(==|=|!=|>=|<=|>|<)\s*(-?\d+(?:\.\d+)?)$/);if(!m)throw new Error('Not understood: "'+part.trim()+'". Write flags like: act >= 2, goat = 0');
    const [,k,op,v]=m;if(op==='='||op==='==')o[k]=+v;else o[k]=Object.assign(typeof o[k]==='object'?o[k]:{}, {[WOP[op]]:+v})}return o}
const flags=(label,obj,key,o)=>field(label,obj,key,Object.assign({fmt:flagsText,parse:textFlags,ph:'always (e.g. act >= 2, goat = 0)'},o||{}));
const card=(title,kids,btns)=>h('div',{class:'card'},h('div',{class:'hd'},h('span',{},title),h('span',{class:'sp'}),btns||null),kids);
const btn=(t,fn,cls,title)=>h('button',{class:cls||'',title:title||'',onclick:fn},t);
const xy=(o,kx,ky)=>[o[kx],o[ky]];
const placeIds=()=>Object.keys(E.W.places).sort();
const allChests=()=>Object.values(E.W.places).flatMap(P=>(P.chests||[]).map(c=>c.name));
const uniq=(base,taken)=>{let i=1,id=base;while(taken.has(id))id=base+'_'+(++i);return id};
const allNpcIds=()=>new Set(Object.values(E.W.places).flatMap(P=>(P.npcs||[]).map(n=>n.id)));

/* ---------------------------------------------------------------- the right side */
const TABS=[['here','Here'],['place','Place'],['scenes','Scenes'],['tiles','Tiles'],['problems','Problems']];
function tabs(){const n=E.check.problems.length;$('#tabs').replaceChildren(...TABS.map(([k,t])=>h('button',{class:E.tab===k?'on':'',onclick:()=>{E.tab=k;tabs();panel()}},t,k==='problems'?h('span',{class:'badge'+(n?'':' ok')},String(n)):null)))}
function panel(){const p=$('#panel'),f={here:hereTab,place:placeTab,scenes:scenesTab,tiles:tilesTab,problems:problemsTab}[E.tab];const y=p.scrollTop;p.replaceChildren(...[].concat(f()));p.scrollTop=y}

function hereTab(){const P=place();if(!E.sel)return[h('p',{class:'dim'},'Click a tile with the Select tool to see and edit what is on it: links (doors, gates, stairs), people, chests, marks, patrols. Drag them to move them.')];
  const [x,y]=E.sel,c=P.rows[y][x],t=legend()[c],out=[h('div',{style:{fontWeight:600,marginBottom:'6px'}},`${x}, ${y} · "${c}" ${t?t.name:'not a tile'}${t&&t.solid?' (solid)':''}`)];
  /* links */
  for(const l of (P.links||[]).filter(l=>l.x===x&&l.y===y)){const T=E.W.places[l.to];
    out.push(card(l.flag==='never'?'A shut way':'Link → '+(T?T.title:l.to||'?'),[
      field('to',l,'to',{type:'select',list:[['','(shut: for later)']].concat(placeIds().map(i=>[i,i]))}),
      h('div',{class:'row'},h('label',{},'arrive at'),num('',l,'tx').lastChild,num('',l,'ty').lastChild,btn('Pick',()=>pickTile('Click where you arrive on '+(l.to||'?'),(a,b)=>{l.tx=a;l.ty=b},l.to))),
      field('how',l,'how',{type:'select',list:[['step','walk onto it'],['bump','walk into it (a solid tile)']]}),
      flags('needs',l,'flag',{fmt:v=>v==null?'':typeof v==='string'?v:flagsText(v),parse:v=>!String(v).trim()?undefined:/^[a-z]+$/i.test(String(v).trim())?String(v).trim():textFlags(v),ph:'nothing ("never" = shut for now)'}),
      h('div',{class:'btns'},T?btn('Go there',()=>goPlace(l.to,l.tx,l.ty)):null,
        T&&!(T.links||[]).some(b=>b.to===E.cur&&Math.abs(b.x-l.tx)+Math.abs(b.y-l.ty)<=1)?btn('Make the way back',()=>change(()=>{T.links=T.links||[];T.links.push({x:l.tx,y:l.ty,to:E.cur,tx:l.x,ty:l.y,how:'step'})}),'go'):null)],
      btn('✕',()=>change(()=>{P.links.splice(P.links.indexOf(l),1)}),'bad','Delete this link')))}
  /* people */
  for(const n of (P.npcs||[]).filter(n=>n.x===x&&n.y===y))out.push(npcCard(P,n));
  for(const ch of (P.chests||[]).filter(ch=>ch.x===x&&ch.y===y))out.push(chestCard(P,ch));
  for(const pt of (P.patrols||[]).filter(pt=>pt.x===x&&pt.y===y))out.push(card('Patrol',[field('name',pt,'name'),field('facing',pt,'face',{type:'select',list:['east','west','north','south']}),
    h('p',{class:'dim'},'A visible group of foes from this map\'s encounters, one level up, facing along the road.')],btn('✕',()=>change(()=>{P.patrols.splice(P.patrols.indexOf(pt),1)}),'bad')));
  if(P.kind==='map')for(const m of (P.marks||[]).filter(m=>m[0]===x&&m[1]===y))out.push(card('Mark',[field('',m,2,{title:'What is here (shown in the docs and the checks: a mark must be reachable)'})],btn('✕',()=>change(()=>{P.marks.splice(P.marks.indexOf(m),1)}),'bad')));
  if((P.stables||[]).some(s=>s[0]===x&&s[1]===y))out.push(card('Raptor stable',[h('p',{class:'dim'},'Fast travel between stables once the first one is open.')],btn('✕',()=>change(()=>{P.stables=P.stables.filter(s=>!(s[0]===x&&s[1]===y))}),'bad')));
  const scenesHere=(E.W.scenes.scenes||[]).filter(sc=>{const a=sc.at||{};if(a.place!==E.cur)return false;const n=a.npc&&(P.npcs||[]).find(n=>n.id===a.npc);
    return(a.tile&&a.tile[0]===x&&a.tile[1]===y)||(n&&n.x===x&&n.y===y)||((a.area||a.bump)&&Math.hypot(x-(a.area||a.bump)[0],y-(a.area||a.bump)[1])<=(a.area||a.bump)[2])});
  if(scenesHere.length)out.push(card('Scenes here',scenesHere.map(sc=>btn('Scene '+sc.id,()=>{E.scene=sc.id;E.tab='scenes';tabs();panel();draw()}))));
  out.push(h('h3',{},'Add here'),h('div',{class:'btns'},
    btn('+ Link',()=>change(()=>{P.links=P.links||[];P.links.push({x,y,to:'',tx:0,ty:0,how:legend()[c]&&legend()[c].solid?'bump':'step',flag:'never'})}),'','A door, gate, stairs or hatch: where walking onto (or into) this tile takes you'),
    btn('+ Person',()=>change(()=>{P.npcs=P.npcs||[];P.npcs.push({id:uniq('someone',allNpcIds()),n:'Someone',x,y,colour:'#c9a24a'})})),
    btn('+ Chest',()=>change(()=>{P.chests=P.chests||[];P.chests.push({name:uniq('a chest',new Set(allChests())),x,y,where:'',items:[{gold:10}]})})),
    P.kind==='map'?btn('+ Mark',()=>change(()=>{P.marks.push([x,y,'something'])})):null,
    P.kind==='map'?btn('+ Patrol',()=>change(()=>{P.patrols=P.patrols||[];P.patrols.push({x,y,face:'east',name:'a patrol'})})):null,
    P.kind==='map'?btn('+ Stable',()=>change(()=>{P.stables=P.stables||[];P.stables.push([x,y])})):null,
    P.kind==='map'?btn('Start here',()=>change(()=>{P.entry=[x,y]}),'','Where the map starts (and where you wake when carried back)'):null,
    btn('+ Scene here',()=>change(()=>{const id=uniq('new',new Set(E.W.scenes.scenes.map(s=>s.id)));E.W.scenes.scenes.push({id,at:{place:E.cur,area:[x,y,1.5]},when:{},steps:[['say']]});E.scene=id;E.tab='scenes'}))));
  return out}
function npcCard(P,n){const sections=Object.keys(E.script);
  return card('Person: '+(n.n||n.id),[field('name',n,'n'),h('div',{class:'row'},h('label',{},'id'),h('input',{value:n.id,title:'Scenes name who you talk to by this',onchange:e=>{const v=e.target.value.trim(),old=n.id;if(!v||allNpcIds().has(v)){alert('An id that is not used yet.');panel();return}
      change(()=>{n.id=v;for(const sc of E.W.scenes.scenes)if(sc.at&&sc.at.npc===old&&sc.at.place===KW.gameId(P))sc.at.npc=v})}})),
    field('colour',n,'colour',{type:'color'}),flags('shown when',n,'show',{title:'Only there while this holds; empty = always'}),
    field('no sprite',n,'door',{type:'check',title:'A door, sign or board: nothing is drawn; its line plays when you bump into it'}),
    field('shop',n,'shop',{ph:'(a shop: hearthspire, pebblebrook)',drop:true}),field('letters',n,'letter',{type:'check',title:'Takes players\' letters to the makers (Quill)'}),
    field('lines from',n,'from',{type:'select',list:[['','(none)']].concat(sections.map(s=>[s,s+' '+E.script[s].title])),title:'The script section their idle lines come from',parse:v=>v||undefined}),
    n.from?h('div',{},h('div',{class:'dim'},'Idle lines (one each time you talk; tap a line to add it):'),
      ...(n.lines||[]).map((a,i)=>h('div',{class:'row'},h('input',{value:a,onchange:e=>change(()=>{n.lines[i]=e.target.value})}),btn('✕',()=>change(()=>{n.lines.splice(i,1)})))),
      lineList(n.from,null,(i,items)=>change(()=>{n.lines=n.lines||[];n.lines.push(anchorFor(items,i,0))}))):null],
    btn('✕',()=>{if(confirm('Delete '+(n.n||n.id)+'?'))change(()=>{P.npcs.splice(P.npcs.indexOf(n),1)})},'bad'))}
function chestCard(P,ch){return card('Chest: '+ch.name,[field('name',ch,'name',{title:'Scenes open a chest by its name'}),field('where',ch,'where',{ph:'(a note for the docs)'}),
  field('contents',ch,'items',{type:'area',fmt:v=>KW.format(v||[]),parse:v=>{const a=JSON.parse(v);if(!Array.isArray(a))throw new Error('The contents are a list: [ ... ]');return a},
    title:'A list of: {"gold":40} · {"use":"Potion","n":2} · {"gear":"Frog boots","tier":0,"slot":"boots","set":"Mossback regalia","bonuses":0}'}),
  h('div',{class:'dim'},'Each thing: {"gold":40} · {"use":"Potion","n":2} · {"gear":"Name","tier":0,"slot":"boots","set":null,"bonuses":0}')],
  btn('✕',()=>change(()=>{P.chests.splice(P.chests.indexOf(ch),1)}),'bad'))}

/* ---------------------------------------------------------------- the place */
function placeTab(){const P=place(),out=[];
  out.push(card(P.kind==='room'?'Room':'Map',[
    h('div',{class:'row'},h('label',{},'id'),h('input',{value:P.id,onchange:e=>renamePlace(P,e.target.value.trim())})),
    field('title',P,'title'),
    h('div',{class:'row'},h('label',{},'size'),h('input',{class:'n',type:'number',value:P.w,id:'pw'}),'×',h('input',{class:'n',type:'number',value:P.h,id:'ph'}),btn('Resize',()=>resize(P,+$('#pw').value,+$('#ph').value),'','Grows or shrinks at the right and bottom edges')),
    field('notes',P,'notes',{type:'area'}),
    field('town',P,'town',{type:'select',list:[['','(none)'],'hearthspire','pebblebrook'],parse:v=>v||undefined,title:'Its town\'s music plays here'}),
    h('div',{class:'row'},h('label',{},'music'),h('input',{placeholder:'(its town\'s, or the meadow)',value:P.music?P.music.key:'',onchange:e=>change(()=>{const k=e.target.value.trim();if(!k)delete P.music;else P.music=Object.assign({},P.music||{},{key:k})})}),
      h('input',{placeholder:'sound',style:{maxWidth:'80px'},value:P.music&&P.music.amb||'',onchange:e=>change(()=>{if(!P.music)return;const a=e.target.value.trim();if(a)P.music.amb=a;else delete P.music.amb})})),
    P.kind==='map'?field('fight board',P,'theme',{type:'select',list:[['','meadow']].concat(THEMES),parse:v=>v||undefined}):null,
    P.kind==='map'?field('dark',P,'dark',{type:'check',on:true,title:'Unlit floor ("d") is dark outside the light'}):null]));
  if(P.kind==='map'){const en=P.encounters;
    out.push(card('Encounters',en?[field('foes from',en,'place',{type:'select',list:E.places6}),num('on tall grass',en,'grass',{title:'Chance a step on tall grass ("): 0.075 = 7.5%',step:0.005}),
      num('on the floor',en,'floor',{title:'Chance a step on any open floor (mines): 0.06 = 6%',step:0.005}),field('board',en,'theme',{type:'select',list:[['','(the map\'s)']].concat(THEMES),parse:v=>v||undefined})]:[h('p',{class:'dim'},'No random fights here.')],
      en?btn('✕',()=>change(()=>{delete P.encounters}),'bad'):btn('+ Add',()=>change(()=>{P.encounters={place:E.places6[0],grass:0.075}}))));
    out.push(card('Flood',P.flood?[h('div',{class:'row'},h('label',{},'column'),h('input',{class:'n',type:'number',value:P.flood[0][0],onchange:e=>change(()=>{P.flood[0][0]=P.flood[1][0]=+e.target.value})}),
      h('label',{},'rows'),h('input',{class:'n',type:'number',value:P.flood[0][1],onchange:e=>change(()=>{P.flood[0][1]=+e.target.value})}),h('input',{class:'n',type:'number',value:P.flood[1][1],onchange:e=>change(()=>{P.flood[1][1]=+e.target.value})})),
      h('p',{class:'dim'},'Under water until Pebblebrook\'s dam opens (the story).')]:[h('p',{class:'dim'},'No flooded road.')],
      P.flood?btn('✕',()=>change(()=>{delete P.flood}),'bad'):null));
    out.push(card('Goals (checked on every save)',[...(P.goals||[]).map((g,i)=>h('div',{class:'step'},
      h('div',{class:'hd'},h('b',{},g.kind==='steps'?'Steps between two tiles':'Keep a tile away'),h('span',{class:'sp'}),btn('✕',()=>change(()=>{P.goals.splice(i,1)}),'bad')),field('label',g,'label'),
      g.kind==='steps'?[h('div',{class:'row'},h('label',{},'from'),String(g.from),btn('Pick',()=>pickTile('Click where the walk starts',(x,y)=>{g.from=[x,y]})),h('label',{},'to'),String(g.to),btn('Pick',()=>pickTile('Click where the walk ends',(x,y)=>{g.to=[x,y]}))),
        h('div',{class:'row'},num('at least',g,'min').lastChild,num('at most',g,'max').lastChild)]
       :[field('tile',g,'tile'),num('at least',g,'min'),h('div',{class:'row'},h('label',{},'from'),g.from.map(String).join(' · '),btn('+ Pick',()=>pickTile('Click a tile to measure from',(x,y)=>{g.from.push([x,y])})))])),
      ...E.check.report.filter(l=>l.startsWith(E.cur+':')).map(l=>h('div',{class:'prob rep'},l.slice(E.cur.length+2)))],
      h('span',{},btn('+ Steps',()=>change(()=>{P.goals=P.goals||[];P.goals.push({kind:'steps',from:P.entry.slice(),to:P.entry.slice(),min:0,max:999,label:'a walk'})})),
        btn('+ Keep away',()=>change(()=>{P.goals=P.goals||[];P.goals.push({kind:'clear',tile:'"',from:[P.entry.slice()],min:10,label:'no encounters near the start'})})))))}
  else out.push(card('What the room\'s things are',[...(P.marks||[]).map((m,i)=>h('div',{class:'row'},h('input',{class:'n',value:m[0],onchange:e=>change(()=>{m[0]=e.target.value})}),
      h('input',{value:m[1],onchange:e=>change(()=>{m[1]=e.target.value})}),btn('✕',()=>change(()=>{P.marks.splice(i,1)}))))],btn('+',()=>change(()=>{P.marks.push(['q','something'])}))));
  const scenesIn=(E.W.scenes.scenes||[]).filter(sc=>(sc.at||{}).place===E.cur);
  out.push(card('Its scenes',scenesIn.length?scenesIn.map(sc=>btn(sc.id,()=>{E.scene=sc.id;E.tab='scenes';tabs();panel();draw()})):h('span',{class:'dim'},'none')));
  const into=Object.entries(E.W.places).flatMap(([gid,Q])=>(Q.links||[]).filter(l=>l.to===E.cur).map(l=>[gid,l]));
  out.push(card('Ways in',into.length?into.map(([gid,l])=>btn(gid+' '+l.x+','+l.y,()=>goPlace(gid,l.x,l.y))):h('span',{class:'dim'},'none: link a door here from another place')));
  out.push(h('div',{class:'btns'},btn('Delete this '+P.kind,()=>{if(!confirm('Delete '+P.title+'? Links and scenes that point here will show as problems.'))return;change(()=>{delete E.W.places[E.cur];E.cur=Object.keys(E.W.places)[0]});fitView();draw()},'bad')));
  return out}
function renamePlace(P,id){if(!id||id===P.id)return;if(!/^[a-z0-9][a-z0-9-]*$/.test(id)){alert('Use lower case letters, numbers and dashes.');panel();return}
  const old=KW.gameId(P),neu=P.kind==='room'?'room:'+id:id;if(E.W.places[neu]){alert('There is already a place called '+neu+'.');panel();return}
  change(()=>{delete E.W.places[old];P.id=id;E.W.places[neu]=P;
    for(const Q of Object.values(E.W.places))for(const l of Q.links||[])if(l.to===old)l.to=neu;
    const walk=steps=>{for(const st of steps||[]){if(st[0]==='goto'&&st[1]===old)st[1]=neu;if(st[0]==='choice')st[1].forEach(c=>walk(c[1]))}};
    for(const sc of E.W.scenes.scenes){if(sc.at&&sc.at.place===old)sc.at.place=neu;walk(sc.steps)}
    for(const c of E.W.scenes.chats||[])if(c.inn===old)c.inn=neu;E.cur=neu})}
function resize(P,w,h){if(!(w>=3&&h>=3&&w<=400&&h<=400)){alert('Between 3 and 400 tiles each way.');return}
  const fill=P.kind==='room'?'q':'.';change(()=>{const rows=[];for(let y=0;y<h;y++){const r=(P.rows[y]||'').slice(0,w);rows.push(r+fill.repeat(w-r.length))}P.rows=rows;P.w=w;P.h=h})}
function newPlaceDialog(){const b=$('#dlgbox'),L=k=>Object.keys(E.W.tiles[k]);let kind='map';
  const render=()=>{b.replaceChildren(h('h3',{},'A new map or room'),
    h('div',{class:'row'},h('label',{},'kind'),h('select',{id:'nk',onchange:e=>{kind=e.target.value;render()},value:kind},opts([['map','map (outdoors)'],['room','room (indoors)']],kind))),
    h('div',{class:'row'},h('label',{},'id'),h('input',{id:'nid',placeholder:'e.g. r2, sunhaven, smithy'})),
    h('div',{class:'row'},h('label',{},'title'),h('input',{id:'nt',placeholder:'e.g. Sunhaven'})),
    h('div',{class:'row'},h('label',{},'size'),h('input',{id:'nw',class:'n',type:'number',value:kind==='room'?13:32}),'×',h('input',{id:'nh',class:'n',type:'number',value:kind==='room'?8:24})),
    h('div',{class:'row'},h('label',{},'ground'),h('select',{id:'nf',value:kind==='room'?'q':'.'},opts(L(kind),kind==='room'?'q':'.')),h('label',{},'edge'),h('select',{id:'nb',value:kind==='room'?'w':'T'},opts(L(kind),kind==='room'?'w':'T'))),
    h('p',{class:'dim'},kind==='room'?'A room needs a way out: an "e" tile with a link back to its door.':'Then link a gate or door to it from another place, and back.'),
    h('div',{class:'btns'},btn('Make it',()=>{const id=$('#nid').value.trim(),gid=kind==='room'?'room:'+id:id;
      if(!/^[a-z0-9][a-z0-9-]*$/.test(id)){alert('The id: lower case letters, numbers and dashes.');return}if(E.W.places[gid]){alert('That id is taken.');return}
      const P=KW.blank(kind,id,+$('#nw').value,+$('#nh').value,$('#nf').value,$('#nb').value);P.title=$('#nt').value.trim()||id;
      if(kind==='room'){const x=Math.floor(P.w/2);P.rows[P.h-1]=P.rows[P.h-1].slice(0,x)+'e'+P.rows[P.h-1].slice(x+1)}
      $('#dlg').style.display='none';change(()=>{E.W.places[gid]=P;E.cur=gid});fitView();draw()},'go'),btn('Cancel',()=>{$('#dlg').style.display='none'})))};
  render();$('#dlg').style.display='flex'}

/* ---------------------------------------------------------------- tiles */
function tilesTab(){const kind=place().kind,L=E.W.tiles[kind];
  return[h('p',{class:'dim'},'The '+kind+' tiles. "Solid" tiles block walking. A sheet is the drawing in art/v6/tiles used once drawn; "stands on" is the ground drawn under it.'),
    ...Object.entries(L).map(([c,t])=>card(h('span',{},h('span',{class:'sw',style:{background:t.colour}},c),' ',t.name),[field('name',t,'name'),field('colour',t,'colour',{type:'color'}),
      field('solid',t,'solid',{type:'check',on:true,parse:v=>!!v}),field('sheet',t,'sheet',{ph:'(none: drawn in code)',parse:v=>v.trim()||undefined,after:()=>loadArt()}),
      field('stands on',t,'under',{type:'select',list:[['','(nothing)']].concat(Object.keys(L)),parse:v=>v||undefined})],
      btn('✕',()=>{const used=Object.values(E.W.places).filter(P=>P.kind===kind&&P.rows.some(r=>r.includes(c)));if(used.length){alert('"'+c+'" is used in '+used.map(P=>P.id).join(', ')+'. Paint it over first.');return}change(()=>{delete L[c]})},'bad'))),
    card('A new tile',[h('div',{class:'row'},h('label',{},'letter'),h('input',{id:'tl',class:'n',maxlength:1}),h('label',{},'name'),h('input',{id:'tn'})),
      h('div',{class:'btns'},btn('Add',()=>{const c=$('#tl').value;if(c.length!==1||L[c]){alert('One letter that is not used yet.');return}change(()=>{L[c]={name:$('#tn').value||c,colour:'#cccccc',solid:false}});E.letter=c;left()},'go')),
      h('p',{class:'dim'},'The game draws a new tile as its colour until it has a sheet; the engine\'s own drawings belong to the letters it knows.')])]}

/* ---------------------------------------------------------------- scenes */
const STEPS=[['say','say lines'],['fight','a set-piece fight'],['class','the class pick'],['join','a companion joins'],['give','give an item'],['set','set flags'],['deed','a dark deed (corruption)'],['kind','a kind deed'],
  ['choice','a choice'],['chest','open a chest'],['goto','move the hero'],['scene','play another scene'],['tint','tint the screen'],['piece','a Smiler piece'],['chat','a campfire chat'],['cart','push the cart (mine)']];
const TRIG=[['npc','talk to someone'],['area','walk near a spot'],['tile','step on a tile'],['bump','bump into something near a spot'],['enter','come into the place'],['start','a new game'],['none','only from another scene']];
function trigKind(a){return a.start?'start':a.none?'none':a.npc?'npc':a.area?'area':a.tile?'tile':a.bump?'bump':a.enter?'enter':'none'}
function sectionOf(sc){return sc.from||sc.id}
/* the shortest start of a line that finds it (from `after` on) */
function anchorFor(items,i,after){const it=items[i],t=(it.text||it.dir||'').replace(/\{hero\}/g,'Pip'),w=t.split(/\s+/);
  for(let n=2;n<=w.length;n++){const a=w.slice(0,n).join(' ');if(KW.findLine(items,a,after)===i)return a}return t}
function lineList(sec,range,onPick,onPick2){const S=E.script[sec];if(!S)return h('div',{class:'dim'},'No section '+sec+' in docs/slice-dialogue.md.');
  return h('div',{class:'lines'},...S.items.map((it,i)=>h('div',{class:'ln'+(it.dir?' dir':'')+(range&&i>=range[0]&&i<=range[1]?' in':''),title:onPick2?'Click: start here · Shift+click: end here':'Click to pick',
    onclick:e=>(e.shiftKey&&onPick2?onPick2:onPick)(i,S.items)},it.dir?'('+it.dir.replace(/\{hero\}/g,'Pip')+')':[h('span',{class:'who'},it.who.replace(/\{hero\}/g,'Pip')+': '),it.text.replace(/\{hero\}/g,'Pip')])))}
function scenesTab(){const SC=E.W.scenes,list=SC.scenes,out=[];
  const shown=E.sceneFilter==='here'?list.filter(sc=>(sc.at||{}).place===E.cur):list;
  out.push(h('div',{class:'row'},h('select',{onchange:e=>{E.sceneFilter=e.target.value;panel()},value:E.sceneFilter},opts([['here','scenes in this place'],['all','all scenes'],['setpieces','set pieces'],['chats','campfire chats'],['more','companions, class pick']],E.sceneFilter)),
    btn('+ Scene',()=>change(()=>{const id=uniq('new',new Set(list.map(s=>s.id)));list.push({id,at:{place:E.cur,enter:1},when:{},steps:[['say']]});E.scene=id;E.sceneFilter='here'}))));
  if(E.sceneFilter==='setpieces')return out.concat(setPiecesEd());
  if(E.sceneFilter==='chats')return out.concat(chatsEd());
  if(E.sceneFilter==='more')return out.concat([card('Companions',[field('',SC,'companions',{type:'area',fmt:v=>KW.format(v),parse:v=>JSON.parse(v)})]),card('Classes offered at the yard drill',[field('',SC,'wave1',{fmt:v=>v.join(', '),parse:v=>v.split(',').map(s=>s.trim()).filter(Boolean)})])]);
  out.push(h('div',{class:'list'},...shown.map(sc=>h('button',{class:'item'+(E.scene===sc.id?' on':''),onclick:()=>{E.scene=E.scene===sc.id?null:sc.id;panel();draw()}},
    h('b',{},sc.id),' · ',TRIG.find(t=>t[0]===trigKind(sc.at||{}))[1]+((sc.at||{}).npc?' ('+sc.at.npc+')':'')+(sc.at&&sc.at.place&&E.sceneFilter==='all'?' in '+sc.at.place:'')))));
  const sc=list.find(s=>s.id===E.scene);if(sc)out.push(sceneEd(sc));return out}
function sceneEd(sc){const a=sc.at=sc.at||{},k=trigKind(a),SC=E.W.scenes,P=E.W.places[a.place],sections=Object.keys(E.script);
  const setTrig=v=>change(()=>{const place=a.place||E.cur;for(const key of Object.keys(a))delete a[key];
    if(v==='start')a.start=1;else if(v==='none')a.none=1;else{a.place=place;const c=E.sel||(E.W.places[place].entry)||[1,1];
      if(v==='npc')a.npc=((E.W.places[place].npcs||[])[0]||{}).id||'';if(v==='area')a.area=[c[0],c[1],1.5];if(v==='tile')a.tile=[c[0],c[1]];if(v==='bump')a.bump=[c[0],c[1],2];if(v==='enter')a.enter=1}});
  const trig=[h('div',{class:'row'},h('label',{},'when you'),h('select',{onchange:e=>setTrig(e.target.value),value:k},opts(TRIG,k)))];
  if(a.place!=null)trig.push(field('in',a,'place',{type:'select',list:placeIds()}));
  if(k==='npc')trig.push(field('who',a,'npc',{type:'select',list:((P&&P.npcs)||[]).map(n=>[n.id,(n.n||n.id)+' ('+n.id+')'])}));
  for(const key of ['area','tile','bump'])if(a[key]){const A=a[key];trig.push(h('div',{class:'row'},h('label',{},'at'),
    h('input',{class:'n',type:'number',value:A[0],onchange:e=>change(()=>{A[0]=+e.target.value})}),h('input',{class:'n',type:'number',value:A[1],onchange:e=>change(()=>{A[1]=+e.target.value})}),
    A.length>2?['within',h('input',{class:'n',type:'number',step:0.5,value:A[2],onchange:e=>change(()=>{A[2]=+e.target.value})})]:null,btn('Pick',()=>pickTile('Click where the scene is',(x,y)=>{A[0]=x;A[1]=y},a.place))))}
  return card('Scene '+sc.id,[
    h('div',{class:'row'},h('label',{},'id'),h('input',{value:sc.id,onchange:e=>{const v=e.target.value.trim();if(!v||SC.scenes.some(s=>s.id===v)){alert('That id is empty or taken.');panel();return}
      change(()=>{const old=sc.id;sc.id=v;E.scene=v;const walk=steps=>{for(const st of steps||[]){if(st[0]==='scene'&&st[1]===old)st[1]=v;if(st[0]==='choice')st[1].forEach(c=>walk(c[1]))}};SC.scenes.forEach(s=>walk(s.steps))})}})),
    field('lines from',sc,'from',{type:'select',list:[['','§'+sc.id+' (its own id)']].concat(sections.map(s=>[s,s+' '+E.script[s].title])),parse:v=>v||undefined,title:'The section of docs/slice-dialogue.md its lines come from'}),
    ...trig,
    flags('only if',sc,'when',{title:'Plays when these flags hold (and only once, unless it repeats)',parse:v=>textFlags(v)||{}}),
    field('repeats',sc,'repeat',{type:'check',title:'Plays every time its flags hold, not just once'}),
    h('h3',{},'What happens'),stepsEd(sc,sc.steps),
    h('div',{class:'btns'},a.place?btn('Show on the map',()=>{goPlace(a.place);const n=a.npc&&(E.W.places[a.place].npcs||[]).find(n=>n.id===a.npc),A=a.area||a.tile||a.bump;if(n)E.sel=[n.x,n.y];else if(A)E.sel=[Math.round(A[0]),Math.round(A[1])];draw()}):null,
      btn('Duplicate',()=>change(()=>{const c=JSON.parse(JSON.stringify(sc));c.id=uniq(sc.id,new Set(SC.scenes.map(s=>s.id)));SC.scenes.splice(SC.scenes.indexOf(sc)+1,0,c);E.scene=c.id})),
      btn('Up',()=>change(()=>{const i=SC.scenes.indexOf(sc);if(i>0)SC.scenes.splice(i-1,0,SC.scenes.splice(i,1)[0])}),'','Earlier in the list: when two scenes could play, the first one does'),
      btn('Delete',()=>{if(confirm('Delete scene '+sc.id+'?'))change(()=>{SC.scenes.splice(SC.scenes.indexOf(sc),1);E.scene=null})},'bad'))])}
function stepsEd(sc,steps){return h('div',{},...steps.map((st,i)=>stepEd(sc,steps,st,i)),
  h('div',{class:'row'},h('select',{},opts(STEPS)),btn('+ Add',e=>{const k=e.target.previousSibling.value;change(()=>{steps.push(newStep(k))})})))}
function newStep(k){return{say:['say'],fight:['fight',Object.keys(E.W.scenes.setpieces)[0]],class:['class'],join:['join',Object.keys(E.W.scenes.companions)[0]],give:['give','potion',1],set:['set',{}],deed:['deed',1],kind:['kind',1],
  choice:['choice',[['Yes',[]],['No',[]]]],chest:['chest',allChests()[0]||''],goto:['goto',E.cur,1,1],scene:['scene',''],tint:['tint','dusk'],piece:['piece','tube'],chat:['chat',(E.W.scenes.chats[0]||{}).id||''],cart:['cart']}[k]}
function stepEd(sc,steps,st,i){const k=st[0],kids=[];
  const sel=(idx,list)=>h('select',{onchange:e=>change(()=>{st[idx]=e.target.value}),value:st[idx]},opts(list,st[idx]));
  const inp=(idx,o)=>h('input',Object.assign({value:st[idx]==null?'':st[idx],onchange:e=>change(()=>{st[idx]=o&&o.num?+e.target.value:e.target.value})},o&&o.num?{type:'number',class:'n'}:{}));
  if(k==='say'){const S=E.script[sectionOf(sc)],items=S?S.items:[];const i0=st[1]==null?0:KW.findLine(items,st[1],0),i1=st[2]==null?items.length-1:KW.findLine(items,st[2],Math.max(0,i0));
    kids.push(h('div',{class:'row'},h('label',{},'from'),h('input',{value:st[1]==null?'':st[1],placeholder:'(the start)',onchange:e=>change(()=>{st[1]=e.target.value.trim()||null})})),
      h('div',{class:'row'},h('label',{},'to'),h('input',{value:st[2]==null?'':st[2],placeholder:'(the end)',onchange:e=>change(()=>{st[2]=e.target.value.trim()||null;if(st[1]===null&&st[2]===null)st.length=1})})),
      h('div',{class:'dim'},S?'Click a line to start there, Shift+click to end there.':'No section '+sectionOf(sc)+' in the script.'),
      lineList(sectionOf(sc),[i0,i1],(j,it)=>change(()=>{st[1]=j===0?null:anchorFor(it,j,0);if(st.length<3)st[2]=null}),(j,it)=>change(()=>{if(st.length<2)st[1]=null;st[2]=j===it.length-1?null:anchorFor(it,j,Math.max(0,i0))})))}
  else if(k==='fight')kids.push(sel(1,Object.keys(E.W.scenes.setpieces)));
  else if(k==='join')kids.push(sel(1,Object.keys(E.W.scenes.companions)));
  else if(k==='give')kids.push(h('div',{class:'row'},inp(1),inp(2,{num:1})),h('div',{class:'dim'},'An item id (potion, ether, bun, lamp, ember, book, gold...) and how many.'));
  else if(k==='set')kids.push(h('input',{value:flagsText(st[1]),style:{width:'100%'},onchange:e=>change(()=>{st[1]=textFlags(e.target.value)||{}})}));
  else if(k==='deed'||k==='kind')kids.push(h('div',{class:'row'},'number',inp(1,{num:1}),h('span',{class:'dim'},'(corruption.md\'s '+(k==='deed'?'dark':'kind')+' deeds)')));
  else if(k==='chest')kids.push(sel(1,allChests()));
  else if(k==='scene')kids.push(sel(1,[''].concat(E.W.scenes.scenes.map(s=>s.id))));
  else if(k==='chat')kids.push(sel(1,(E.W.scenes.chats||[]).map(c=>c.id)));
  else if(k==='tint'||k==='piece')kids.push(inp(1));
  else if(k==='goto')kids.push(h('div',{class:'row'},sel(1,placeIds()),inp(2,{num:1}),inp(3,{num:1}),btn('Pick',()=>pickTile('Click where the hero goes',(x,y)=>{st[2]=x;st[3]=y},st[1]))));
  else if(k==='choice')kids.push(...st[1].map((c,j)=>h('div',{class:'sub'},h('div',{class:'row'},h('input',{value:c[0],onchange:e=>change(()=>{c[0]=e.target.value})}),btn('✕',()=>change(()=>{st[1].splice(j,1)}))),stepsEd(sc,c[1]))),
    btn('+ Option',()=>change(()=>{st[1].push(['Another',[]])})));
  return h('div',{class:'step'},h('div',{class:'hd'},h('b',{},(STEPS.find(s=>s[0]===k)||[k,k])[1]),h('span',{class:'sp'}),
    btn('↑',()=>change(()=>{if(i>0)steps.splice(i-1,0,steps.splice(i,1)[0])})),btn('↓',()=>change(()=>{if(i<steps.length-1)steps.splice(i+1,0,steps.splice(i,1)[0])})),btn('✕',()=>change(()=>{steps.splice(i,1)}),'bad')),kids)}
function setPiecesEd(){const SP=E.W.scenes.setpieces;
  return[...Object.entries(SP).map(([id,s])=>card('Set piece: '+id,[
    s.boss!=null?field('boss',s,'boss',{type:'select',list:E.bosses}):h('div',{},...(s.foes||[]).map((f,j)=>h('div',{class:'row'},
      h('select',{onchange:e=>change(()=>{f[0]=e.target.value}),value:f[0]},opts(E.foes,f[0])),h('input',{class:'n',type:'number',title:'level',value:f[1],onchange:e=>change(()=>{f[1]=+e.target.value})}),
      h('input',{placeholder:'kind (big, elite)',style:{maxWidth:'90px'},value:f[2]||'',onchange:e=>change(()=>{const v=e.target.value.trim();if(v)f[2]=v;else f.length=Math.min(f.length,2)})}),
      h('input',{placeholder:'name',style:{maxWidth:'100px'},value:f[3]||'',onchange:e=>change(()=>{const v=e.target.value.trim();if(!f[2])f[2]='';if(v)f[3]=v;else f.length=3})}),
      btn('✕',()=>change(()=>{s.foes.splice(j,1)})))),btn('+ Foe',()=>change(()=>{s.foes.push([E.foes[0],1])}))),
    field('board',s,'theme',{type:'select',list:THEMES}),field('hero alone',s,'solo',{type:'check'})],
    btn('✕',()=>{const used=E.W.scenes.scenes.filter(sc=>JSON.stringify(sc.steps).includes('["fight","'+id+'"]'));if(used.length&&!confirm(id+' is used by scene '+used.map(s=>s.id).join(', ')+'. Delete anyway?'))return;change(()=>{delete SP[id]})},'bad'))),
    card('A new set piece',[h('div',{class:'row'},h('label',{},'id'),h('input',{id:'spid'}),h('label',{},h('input',{type:'checkbox',id:'spb'}),' boss')),
      btn('Add',()=>{const id=$('#spid').value.trim();if(!id||SP[id]){alert('An id that is not used yet.');return}change(()=>{SP[id]=$('#spb').checked?{boss:E.bosses[0],theme:'meadow'}:{foes:[[E.foes[0],1]],theme:'meadow'}})},'go')])]}
function chatsEd(){const C=E.W.scenes.chats;const inns=placeIds().filter(i=>i.startsWith('room:'));
  return[h('p',{class:'dim'},'Campfire chats play at an inn\'s hearth when everyone in them is in the pack (slice-dialogue.md §6).'),...C.map((c,i)=>card('Chat '+c.id,[
    field('section',c,'id',{type:'select',list:Object.keys(E.script).filter(s=>s.startsWith('6.'))}),field('inn',c,'inn',{type:'select',list:inns}),
    field('who',c,'who',{fmt:v=>(v||[]).join(', '),parse:v=>v.split(',').map(s=>s.trim()).filter(Boolean)}),flags('only if',c,'when',{drop:true})],btn('✕',()=>change(()=>{C.splice(i,1)}),'bad'))),
    btn('+ Chat',()=>change(()=>{C.push({id:'6.1',inn:inns[0],who:[]})}))]}

/* ---------------------------------------------------------------- problems */
function problemsTab(){const C=E.check,out=[];
  out.push(h('p',{class:'dim'},C.problems.length?'Fix these before you commit: the game is only released when the world has no problems.':'No problems. Save, then commit and push with GitHub Desktop.'));
  for(const p of C.problems)out.push(h('div',{class:'prob',onclick:()=>goProblem(p)},h('b',{},p.where),': ',p.msg));
  if(C.notes.length)out.push(h('h3',{},'Worth a look'),...C.notes.map(n=>h('div',{class:'prob note'},n)));
  if(C.report.length)out.push(h('h3',{},'Goals'),...C.report.map(n=>h('div',{class:'prob rep'},n)));
  return out}
function goProblem(p){const w=p.where;if(w.startsWith('scene ')){E.scene=w.slice(6);E.sceneFilter='all';E.tab='scenes';tabs();panel();draw();return}
  if(w.startsWith('set piece')){E.sceneFilter='setpieces';E.tab='scenes';tabs();panel();return}
  const m=p.msg.match(/(\d+),\s?(\d+)/);goPlace(w,m?+m[1]:null,m?+m[2]:null)}

/* ---------------------------------------------------------------- start */
function refresh(){top();left();tabs();panel();draw();recheck();status()}
let ready=false;
function setup(){if(!ready){ready=true;bindCanvas();
  $('#place').onchange=e=>goPlace(e.target.value);$('#save').onclick=save;$('#undo').onclick=undo;$('#redo').onclick=redo;$('#newplace').onclick=newPlaceDialog;
  window.addEventListener('keydown',e=>{const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement&&document.activeElement.tagName);
    if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();save();return}
    if(typing)return;
    if((e.ctrlKey||e.metaKey)&&(e.key==='z'||e.key==='Z')){e.preventDefault();e.shiftKey?redo():undo();return}
    if((e.ctrlKey||e.metaKey)&&e.key==='y'){e.preventDefault();redo();return}
    if(e.key==='Escape'&&E.pick){E.pick=null;$('#pickbar').style.display='none';return}
    if(e.key===' '){E.space=true;return}
    const t=TOOLS.find(t=>t[2].toLowerCase()===e.key.toLowerCase());if(t&&!e.ctrlKey&&!e.metaKey){E.tool=t[0];left();draw()}});
  window.addEventListener('keyup',e=>{if(e.key===' ')E.space=false});
  window.addEventListener('beforeunload',e=>{if(changed().list.length){e.preventDefault();e.returnValue=''}})}
  fitView();refresh()}
async function boot(){
  if(window.__kqFs){try{await openFs(window.__kqFs)}catch(e){$('#werr').textContent=e.message}return}
  if(!window.showDirectoryPicker){$('#werr').textContent='This browser cannot open folders. Use Chrome or Edge on a computer.';$('#open').disabled=true;return}
  const prev=await idbGet('repo');
  if(prev){const b=$('#reopen');b.style.display='';b.textContent='Open '+prev.name+' again';b.onclick=async()=>{try{if(await prev.requestPermission({mode:'readwrite'})==='granted')await openFs(dirFs(prev))}catch(e){$('#werr').textContent=e.message}}}
  $('#open').onclick=async()=>{try{const d=await window.showDirectoryPicker({id:'kobold-quest',mode:'readwrite'});await openFs(dirFs(d));idbSet('repo',d)}catch(e){if(e.name!=='AbortError')$('#werr').textContent=e.message}}}
/* for the test: the state and the one way to change it */
window.KQEditor=E;window.KQEd={change,save,goPlace,undo,redo};
boot()})();
