/* The world's data: the files in world/ that the map editor (tools/editor) edits and tools/gen-data.js turns into the game's data.
   One script for both: node requires it, the editor loads it with a <script> tag (as window.KQWorld).

     world/tiles.json         the tile letters, one legend for maps and one for rooms: name, colour, solid, sheet (art/tiles), under
     world/maps/<id>.json     a map (outdoors; the game calls it <id>)
     world/rooms/<id>.json    a room (indoors; the game calls it room:<id>)
     world/scenes.json        the story's wiring: companions, the class pick, set pieces, scenes, campfire chats

   A place: {id, kind:'map'|'room', title, w, h, rows (one string a row, one letter a tile), entry [x,y] (maps), marks, notes,
     links [{x,y,to,tx,ty,how:'step'|'bump',flag}] (to = another place's game id, or '' with flag 'never' for a way that is shut),
     npcs [{id,n,x,y,colour,show,from,lines,door,shop,letter}], chests [{name,x,y,where,items}], patrols [{x,y,face,name}],
     stables [[x,y]], flood [[x,y0],[x,y1]], encounters {place,grass,floor,theme}, theme, music {key,amb}, town, dark,
     goals [{kind:'steps',from,to,min,max,label} | {kind:'clear',tile,from:[[x,y]...],min,label}]}
   Map marks are [x,y,label]; room marks are [letter,label]. The lines people say stay in docs/slice-dialogue.md: scenes and NPCs
   point at them by anchors (a few words of a line), found here so a changed line is caught. */
(function(root,make){if(typeof module==='object'&&module.exports)module.exports=make();else root.KQWorld=make()})(typeof self!=='undefined'?self:this,function(){
'use strict';

/* ---------------------------------------------------------------- the files: one way to write them, so every save diffs cleanly */
function format(v,ind,key){ind=ind||'';const one=JSON.stringify(v);
  if(v===null||typeof v!=='object')return one;
  if(one.length<=120&&key!=='rows')return one;   // short things on one line; a place's rows always one to a line, so the map reads as a map
  const i2=ind+' ';
  if(Array.isArray(v))return v.length?'[\n'+v.map(x=>i2+format(x,i2)).join(',\n')+'\n'+ind+']':'[]';
  const k=Object.keys(v).filter(k=>v[k]!==undefined);return k.length?'{\n'+k.map(k=>i2+JSON.stringify(k)+': '+format(v[k],i2,k)).join(',\n')+'\n'+ind+'}':'{}'}
const gameId=P=>P.kind==='room'?'room:'+P.id:P.id;
const fileOf=P=>(P.kind==='room'?'rooms/':'maps/')+P.id+'.json';
/* a new place, filled with one letter (maps get a wall of their border letter) */
function blank(kind,id,w,h,fill,border){const rows=[];for(let y=0;y<h;y++){let r='';for(let x=0;x<w;x++)r+=(border&&(x===0||y===0||x===w-1||y===h-1))?border:fill;rows.push(r)}
  const P={id,kind,title:id,w,h,rows,marks:[],notes:'',links:[],npcs:[],chests:[]};
  if(kind==='map')Object.assign(P,{entry:[1,1],patrols:[],stables:[],goals:[]});return P}

/* ---------------------------------------------------------------- the script (docs/slice-dialogue.md) as scenes of lines
   A scene is a "### n.m" section (text under a "## n." heading before its first "###" is scene "n.0"). Each item is a spoken line
   {who, text}, a sign or board {who, text}, or a stage direction {dir}. "Pip" is the hero: written {hero} for the game to fill.
   Stage directions are shown as narration unless they are notes for the engine (NOTE). */
const NOTE=/^Sets |taught here|teaches|picker opens|Flavour only|quest log|chest can be opened|chats unlock|has no lines|is unlocked|joins\b|join\.|(Fight\.)|^After( the bout)?:|^Either way|^Back at Marl|^Pip goes to the mill|^\(|lines below|^It follows/i;
const clean=t=>t.replace(/\*\(([^)]*)\)\*/g,'($1)').replace(/\*\*/g,'').replace(/(^|[\s(])\*([^*]+)\*(?=[\s.,!?)]|$)/g,'$1$2').replace(/^\*|\*$/g,'').replace(/\s+/g,' ').trim();
const heroName=t=>t.replace(/\bPip\b/g,'{hero}');
function parseScript(text){const S={};let part=null,cur=null;
  for(const raw of text.split('\n')){const line=raw.trim();
    const h2=line.match(/^## (\d+)\. (.*)/);if(h2){part=h2[1];cur=['0','4','5','7','8'].includes(part)?null:(S[part+'.0']={id:part+'.0',title:h2[2],items:[]});continue}
    const h3=line.match(/^### (\d+\.\d+) (.*)/);if(h3){cur=S[h3[1]]={id:h3[1],title:h3[2].replace(/\*/g,''),items:[]};continue}
    if(!cur||!line||line.startsWith('|')||line.startsWith('#'))continue;
    const m=[...line.matchAll(/\*\*([^*]+?)\*\*\s*(?:\*?\(([^)]*)\)\*?)?\*\*:\*\*\s*|\*\*([^*]+?):\*\*\s*/g)].pop();
    if(m){const who=(m[1]||m[3]).trim(),when=m[2]||null,t=line.slice(m.index+m[0].length),pre=clean(line.slice(0,m.index));
      if(pre&&!/^\*\*/.test(line))cur.items.push({dir:pre});
      cur.items.push(Object.assign({who:heroName(who),text:heroName(clean(t))},when?{when}:{}));continue}
    if(/^\*.*\*$/.test(line)||/^\*[A-Z]/.test(line))cur.items.push({dir:heroName(clean(line))})}
  for(const k of Object.keys(S))if(!S[k].items.length)delete S[k];
  for(const k of Object.keys(S))S[k].items.forEach(i=>{if(i.dir)i.show=!NOTE.test(i.dir)});
  return S}
/* the item an anchor names, at or after `from`; -1 when none */
function findLine(items,a,from){return items.findIndex((it,j)=>j>=(from||0)&&((it.text||'')+' '+(it.dir||'')).includes(a.replace(/\bPip\b/g,'{hero}')))}

/* ---------------------------------------------------------------- walking */
const solidIn=(W,P)=>{const L=W.tiles[P.kind]||{};return c=>!!(L[c]&&L[c].solid)};
/* steps from a tile to every tile reachable (a solid tile can be the goal: stand next to it) */
function reach(W,P,sx,sy){const solid=solidIn(W,P),D=new Map(),q=[[sx,sy]];D.set(sx+','+sy,0);
  while(q.length){const [x,y]=q.shift(),d=D.get(x+','+y);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(D.has(k)||nx<0||ny<0||nx>=P.w||ny>=P.h)continue;
      if(solid(P.rows[ny][nx]))continue;D.set(k,d+1);q.push([nx,ny])}}
  return D}
const stepsTo=(D,x,y)=>{let d=D.get(x+','+y);if(d!=null)return d;let b=null;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const v=D.get((x+dx)+','+(y+dy));if(v!=null&&(b==null||v+1<b))b=v+1}return b};
/* where a room is walked from: its way out */
function roomStart(P){for(let y=0;y<P.h;y++){const x=P.rows[y].indexOf('e');if(x>=0)return[x,y]}return null}

/* ---------------------------------------------------------------- the checks: what must hold for the game to work
   opt: {script (parseScript's result), foes (bestiary ids), places6 (encounter place names)}. Returns {problems, notes, report}:
   a problem stops the release; a note is worth a look (a flag set but never read); the report is the goals' counts. */
function check(W,opt){opt=opt||{};const problems=[],notes=[],report=[],bad=(where,msg)=>problems.push({where,msg});
  const places=W.places,ids=new Set(Object.keys(places)),npcIds=new Map();
  for(const [gid,P] of Object.entries(places)){const where=gid,legend=W.tiles[P.kind]||{};
    if(!/^[a-z0-9][a-z0-9-]*$/.test(P.id))bad(where,'the id must be lower case letters, numbers and dashes');
    if(P.rows.length!==P.h)bad(where,`${P.rows.length} rows, not ${P.h}`);
    P.rows.forEach((r,y)=>{if(r.length!==P.w)bad(where,`row ${y} is ${r.length} wide, not ${P.w}`);for(const c of new Set(r))if(!legend[c])bad(where,`row ${y}: the letter "${c}" is not a ${P.kind} tile`)});
    const inside=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<P.w&&y<P.h;
    const start=P.kind==='map'?P.entry:roomStart(P);
    if(!start)bad(where,P.kind==='map'?'no entry':'no way out (an "e" tile)');else if(!inside(...start))bad(where,'the entry is off the map');
    const D=start&&inside(...start)?reach(W,P,...start):new Map();
    if(P.kind==='map')(P.marks||[]).forEach(([x,y,l])=>{if(!inside(x,y))bad(where,`the mark "${l}" is off the map`);else if(stepsTo(D,x,y)==null)bad(where,`"${l}" at ${x},${y} cannot be reached`)});
    for(const L of P.links||[]){if(!inside(L.x,L.y)){bad(where,`a link at ${L.x},${L.y} is off the map`);continue}
      if(L.flag==='never')continue;const T=places[L.to];
      if(!T){bad(where,`the link at ${L.x},${L.y} leads to "${L.to}", which is not a place`);continue}
      if(!(L.tx>=0&&L.ty>=0&&L.tx<T.w&&L.ty<T.h))bad(where,`the link at ${L.x},${L.y} lands off ${L.to}`);
      else if(!(T.links||[]).some(b=>b.to===gid&&Math.abs(b.x-L.tx)+Math.abs(b.y-L.ty)<=1))bad(where,`the link at ${L.x},${L.y} → ${L.to} has no way back`);
      if(stepsTo(D,L.x,L.y)==null)bad(where,`the link at ${L.x},${L.y} cannot be reached`)}
    for(const n of P.npcs||[]){if(npcIds.has(n.id))bad(where,`two people are called "${n.id}" (also in ${npcIds.get(n.id)})`);npcIds.set(n.id,gid);
      if(!inside(n.x,n.y))bad(where,`${n.n||n.id} stands off the map`);
      if(n.from&&opt.script){const S=opt.script[n.from];if(!S)bad(where,`${n.id}: no scene ${n.from} in the script`);else(n.lines||[]).forEach(a=>{if(findLine(S.items,a,0)<0)bad(where,`${n.id}: the line "${a}" is not in ${n.from}`)})}}
    for(const c of P.chests||[])if(c.x!=null&&!inside(c.x,c.y))bad(where,`the chest "${c.name}" is off the map`);
    for(const p of P.patrols||[])if(!inside(p.x,p.y))bad(where,`the patrol "${p.name}" is off the map`);
    for(const s of P.stables||[])if(!inside(...s))bad(where,'a stable is off the map');
    if(P.encounters&&opt.places6&&!opt.places6.includes(P.encounters.place))bad(where,`encounters: "${P.encounters.place}" is not a place in the bestiary`);
    for(const g of P.goals||[]){
      if(g.kind==='steps'){const d=stepsTo(reach(W,P,...g.from),...g.to);report.push(`${gid}: ${g.label||'steps'}: ${d==null?'no way':d+' steps'} (goal ${g.min} to ${g.max})`);
        if(d==null||d<g.min||d>g.max)bad(where,`${g.label||'steps'}: ${d==null?'no way through':d+' steps'}, the goal is ${g.min} to ${g.max}`)}
      if(g.kind==='clear'){let near=Infinity;for(const f of g.from){const R=reach(W,P,...f);for(const [k,d] of R){const [x,y]=k.split(',').map(Number);if(P.rows[y][x]===g.tile)near=Math.min(near,d)}}
        report.push(`${gid}: ${g.label||'clear'}: the nearest "${g.tile}" is ${near===Infinity?'nowhere':near+' steps'} away (goal at least ${g.min})`);
        if(near<g.min)bad(where,`${g.label||'clear'}: a "${g.tile}" tile is only ${near} steps away, the goal is at least ${g.min}`)}}}
  /* the story */
  const S=W.scenes||{},SP=S.setpieces||{},CO=S.companions||{},sceneIds=new Set((S.scenes||[]).map(s=>s.id)),chests=new Set();
  for(const P of Object.values(places))(P.chests||[]).forEach(c=>chests.add(c.name));
  const npcAt=(place,id)=>places[place]&&(places[place].npcs||[]).some(n=>n.id===id);
  const set=new Map(),read=new Map(),flagsOf=(w,into,who)=>{if(!w||typeof w!=='object')return;for(const [k,v] of Object.entries(w)){if(k==='any'&&Array.isArray(v)){v.forEach(x=>flagsOf(x,into,who));continue}if(!into.has(k))into.set(k,who)}};
  for(const sp of Object.entries(SP))(sp[1].foes||[]).forEach(f=>{if(opt.foes&&!opt.foes.includes(f[0]))bad('set piece '+sp[0],`the foe "${f[0]}" is not in the bestiary`)});
  for(const sc of S.scenes||[]){const where='scene '+sc.id,a=sc.at||{};
    if(!a.start&&!a.none){if(!places[a.place])bad(where,`plays in "${a.place}", which is not a place`);
      else{const P=places[a.place],inside=(x,y)=>x>=0&&y>=0&&x<P.w&&y<P.h;
        if(a.npc&&!npcAt(a.place,a.npc))bad(where,`nobody called "${a.npc}" stands in ${a.place}`);
        if(a.tile&&!inside(...a.tile))bad(where,'its tile is off the map');if(a.area&&!inside(Math.round(a.area[0]),Math.round(a.area[1])))bad(where,'its area is off the map');
        if(a.bump&&!inside(Math.round(a.bump[0]),Math.round(a.bump[1])))bad(where,'its bump is off the map')}}
    flagsOf(sc.when,read,sc.id);read.set(sc.id,sc.id);
    const items=opt.script&&(opt.script[sc.from||sc.id]||{}).items;if(opt.script&&!items&&(sc.steps||[]).some(s=>s[0]==='say'))bad(where,`no section ${sc.from||sc.id} in the script`);
    const walk=steps=>{for(const st of steps||[]){const k=st[0];
      if(k==='say'&&items){const i=st[1]==null?0:findLine(items,st[1],0),j=st[2]==null?items.length-1:findLine(items,st[2],Math.max(0,i));
        if(i<0||j<0||j<i)bad(where,`the line "${i<0?st[1]:st[2]}" is not in ${sc.from||sc.id} (or not after the one before)`)}
      if(k==='fight'&&!SP[st[1]])bad(where,`no set piece "${st[1]}"`);
      if(k==='join'&&!CO[st[1]])bad(where,`no companion "${st[1]}"`);
      if(k==='chest'&&!chests.has(st[1]))bad(where,`no chest called "${st[1]}"`);
      if(k==='scene'&&!sceneIds.has(st[1]))bad(where,`no scene "${st[1]}"`);
      if(k==='goto'&&!places[st[1]])bad(where,`goto "${st[1]}": not a place`);
      if(k==='set')flagsOf(st[1],set,sc.id);
      if(k==='choice')(st[1]||[]).forEach(c=>walk(c[1]))}};
    walk(sc.steps)}
  for(const P of Object.values(places))for(const n of P.npcs||[])flagsOf(n.show,read,n.id);
  for(const c of S.chats||[])flagsOf(c.when,read,'chat '+c.id);
  for(const P of Object.values(places))for(const L of P.links||[])if(L.flag&&L.flag!=='never')flagsOf(typeof L.flag==='string'?{[L.flag]:1}:L.flag,read,'a link');
  for(const [f,who] of set)if(!read.has(f))notes.push(`the flag "${f}" is set (${who}) but nothing waits for it`);
  for(const [f,who] of read)if(!set.has(f)&&!sceneIds.has(f)&&f!=='act'&&f!=='pb')notes.push(`"${f}" is waited for (${who}) but no scene sets it`);
  return{problems,notes,report}}

/* ---------------------------------------------------------------- the game's data (src/data/v6/maps.js and story.js) */
function toGame(W,script,places6){const MAPS6={},ROOMS6={},LINKS6=[],NPCS6=[],CHESTS6=[];
  const roomSolid=Object.entries(W.tiles.room).filter(([,t])=>t.solid).map(([c])=>c);
  for(const [gid,P] of Object.entries(W.places)){
    const extra={};for(const k of ['theme','music','town','dark'])if(P[k]!=null)extra[k]=P[k];
    if(P.kind==='map'){const enc=P.encounters?Object.assign({},P.encounters,{place:places6?places6.indexOf(P.encounters.place):P.encounters.place}):null;
      MAPS6[P.id]=Object.assign({flood:P.flood||null,title:P.title,w:P.w,h:P.h,rows:P.rows,marks:P.marks||[],entry:P.entry,notes:P.notes||'',patrols:P.patrols||[],stables:P.stables||[]},enc?{enc}:{},extra)}
    else ROOMS6[P.id]=Object.assign({title:P.title,rows:P.rows,marks:P.marks||[],solid:roomSolid},extra);
    for(const L of P.links||[])LINKS6.push(L.flag?[gid,L.x,L.y,L.to||'',L.tx||0,L.ty||0,L.how||'step',L.flag]:[gid,L.x,L.y,L.to,L.tx,L.ty,L.how||'step']);
    for(const n of P.npcs||[]){const o=Object.assign({},n,{place:gid});if(o.from&&script){const it=(script[o.from]||{items:[]}).items;o.lines=(o.lines||[]).map(a=>findLine(it,a,0))}NPCS6.push(o)}
    for(const c of P.chests||[])CHESTS6.push({name:c.name,place:c.x!=null?gid:null,x:c.x!=null?c.x:null,y:c.y!=null?c.y:null,where:c.where||'',items:c.items})}
  /* the scenes with their anchors turned into line numbers: ['say', from, to, i, j] */
  const SC=JSON.parse(JSON.stringify((W.scenes||{}).scenes||[]));
  if(script)for(const sc of SC){const items=(script[sc.from||sc.id]||{items:[]}).items;const walk=steps=>{for(const st of steps){if(st[0]==='say'){const i=st[1]==null?0:findLine(items,st[1],0),j=st[2]==null?items.length-1:findLine(items,st[2],Math.max(0,i));st[1]=st[1]===undefined?null:st[1];st[2]=st[2]===undefined?null:st[2];st[3]=i;st[4]=j}if(st[0]==='choice')st[1].forEach(c=>walk(c[1]))}};walk(sc.steps)}
  return{MAPS6,ROOMS6,LINKS6,TILES6:W.tiles,NPCS6,CHESTS6,SCENES6:SC}}

/* ---------------------------------------------------------------- node: read the world from the repo */
function load(rootDir){const fs=require('fs'),path=require('path'),D=path.join(rootDir,'world'),W={tiles:JSON.parse(fs.readFileSync(path.join(D,'tiles.json'),'utf8')),places:{},scenes:JSON.parse(fs.readFileSync(path.join(D,'scenes.json'),'utf8'))};
  for(const kind of ['maps','rooms'])for(const f of fs.readdirSync(path.join(D,kind)).filter(f=>f.endsWith('.json')).sort()){const P=JSON.parse(fs.readFileSync(path.join(D,kind,f),'utf8'));
    P.kind=kind==='maps'?'map':'room';if(P.id!==f.slice(0,-5))throw new Error(`world/${kind}/${f}: its id is "${P.id}"`);W.places[gameId(P)]=P}
  return W}
function save(rootDir,W){const fs=require('fs'),path=require('path'),D=path.join(rootDir,'world');
  for(const k of ['maps','rooms'])fs.mkdirSync(path.join(D,k),{recursive:true});
  fs.writeFileSync(path.join(D,'tiles.json'),format(W.tiles)+'\n');fs.writeFileSync(path.join(D,'scenes.json'),format(W.scenes)+'\n');
  for(const P of Object.values(W.places))fs.writeFileSync(path.join(D,fileOf(P)),format(placeFile(P))+'\n')}
/* a place as written: the fields in a fixed order, the kind left out (the folder says it) */
const ORDER=['id','title','w','h','entry','notes','town','music','theme','dark','encounters','flood','rows','marks','links','npcs','chests','patrols','stables','goals'];
function placeFile(P){const o={};for(const k of ORDER)if(P[k]!==undefined)o[k]=P[k];for(const k of Object.keys(P))if(!(k in o)&&k!=='kind')o[k]=P[k];return o}

return{format,gameId,fileOf,blank,parseScript,findLine,NOTE,reach,stepsTo,roomStart,check,toGame,load,save,placeFile,ORDER}});
