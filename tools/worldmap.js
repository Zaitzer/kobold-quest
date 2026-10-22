#!/usr/bin/env node
'use strict';
/* Kobold Quest v6: the world map, as data and as a picture, from one source.
   Writes docs/world-map.json (what the slice builds REGION from) and docs/world-map.svg (the map to look at).
   Towns sit where the P9 check put them (world-plan.md), on the shrunk 420 × 340 grid. Each route winds until its length
   matches its step count in the world plan.   Usage: node tools/worldmap.js                                            */
const fs=require('fs'),path=require('path');
const W=420,H=340;

const TOWNS={
  hearthspire:{name:'Hearthspire',x:190,y:170,r:16,kind:'capital',levels:'1–3, 17–19, 27–30',note:'the capital; the castle, the nest, the tower fire'},
  pebblebrook:{name:'Pebblebrook',x:98,y:170,r:10,kind:'town',levels:'3–8',note:'the mill, the dam, the mine'},
  sunhaven:{name:'Sunhaven',x:59,y:287,r:10,kind:'town',levels:'8–13',note:'the oasis, the honey cellars'},
  emberreach:{name:'Emberreach',x:190,y:285,r:10,kind:'town',levels:'13–18',note:'the volcano ovens, the crater'},
  frostwick:{name:'Frostwick',x:190,y:47,r:10,kind:'town',levels:'19–23',note:'the fort, the ice cellars'},
  saltspray:{name:'Saltspray',x:313,y:170,r:10,kind:'town',levels:'23–27',note:'the harbour, the lighthouse'},
  islands:{name:'the islands',x:382,y:178,r:9,kind:'islands',levels:'25–27',note:'the ember-lantern isle, the island cave'},
};
/* routes: from, to, steps (world-plan.md), land, which side the road bends to (+1 / −1), opened by */
const ROUTES=[
  ['R1','hearthspire','pebblebrook',120,'grass, then the mill road',1,'open from the start (the capital gate)'],
  ['R2','pebblebrook','sunhaven',160,'grass, then desert',-1,'open'],
  ['R3','sunhaven','emberreach',170,'desert, then a mountain pass',1,'open; a raptor cliff shortcut later'],
  ['R4','emberreach','hearthspire',150,'the bun road: pass, then grass',-1,'the toll (three pieces)'],
  ['R5','hearthspire','frostwick',160,'grass, then snowfield',1,'the north gate, shut until the flour tunnel'],
  ['R6','hearthspire','saltspray',160,'grass, then shore',-1,'the east gate, shut until the flour tunnel'],
  ['R7','saltspray','islands',90,'by boat',1,'the boats, after the harbour is patched'],
];
/* a winding road: a sine bend across the straight line, amplitude found so the length matches the steps (1 step = 1 tile) */
function road(a,b,steps,side){const A=TOWNS[a],B=TOWNS[b],dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,waves=2;
  const pts=amp=>{const p=[];for(let i=0;i<=60;i++){const t=i/60,o=side*amp*Math.sin(Math.PI*waves*t)*Math.sin(Math.PI*t);p.push([A.x+dx*t+nx*o,A.y+dy*t+ny*o])}return p};
  const len=p=>p.slice(1).reduce((s,q,i)=>s+Math.hypot(q[0]-p[i][0],q[1]-p[i][1]),0);
  let lo=0,hi=80;for(let i=0;i<50;i++){const m=(lo+hi)/2;len(pts(m))<steps?lo=m:hi=m}
  const p=pts((lo+hi)/2);return{points:p.map(([x,y])=>[Math.round(x),Math.round(y)]),length:Math.round(len(p)),straight:Math.round(L)}}
const R=ROUTES.map(([id,a,b,steps,land,side,open])=>Object.assign({id,from:a,to:b,steps,land,open},road(a,b,steps,side)));
const at=(id,t)=>{const p=R.find(r=>r.id===id).points;return p[Math.round(t*(p.length-1))]};

/* biomes: soft regions (the land under each part of the story) */
const BIOMES=[
  {id:'grass',name:'meadows',color:'#6cbf4c',shapes:[[150,170,120,70],[110,150,60,50]]},
  {id:'farms',name:'the Mossback farms',color:'#8fcf5a',shapes:[[85,205,34,22]]},
  {id:'desert',name:'desert',color:'#e9d18b',shapes:[[70,280,70,48]]},
  {id:'mountain',name:'mountains',color:'#8a7a8f',shapes:[[150,280,70,40],[190,240,40,26]]},
  {id:'volcano',name:'the volcano',color:'#b0574a',shapes:[[212,300,26,22]]},
  {id:'snow',name:'snowfield',color:'#eef4fb',shapes:[[190,60,100,48],[190,100,60,26]]},
  {id:'shore',name:'shore',color:'#f1e2b0',shapes:[[300,175,26,70]]},
  {id:'sea',name:'the sea',color:'#3a8fd9',shapes:[[395,170,70,175],[345,300,30,30],[345,40,30,30]]},
  {id:'city',name:'Hearthspire',color:'#d9d2e6',shapes:[[190,170,24,22]]},
  {id:'island',name:'the islands',color:'#8fcf5a',sharp:true,shapes:[[382,182,15,10],[360,208,7,5],[398,148,6,4]]},
];
const PLACES=[
  ['the mine','area',[84,146],'Pebblebrook\'s dungeon: 3 floors'],['the mill','landmark',[126,150],'the wheel, and the dam behind it'],
  ['raptor stable','field move',at('R1',0.7),'on the mill road; opens with the first piece'],
  ['honey cellars','area',[34,314],'Sunhaven\'s dungeon'],['the oasis','landmark',[74,264],''],
  ['hot springs','extra',at('R3',0.55),'heals'],['cliff shortcut','field move',at('R3',0.8),'raptors only'],
  ['the crater','area',[214,302],'Emberreach\'s dungeon'],['toll gate','barrier',at('R4',0.4),'until three pieces'],
  ['draft outpost','story',at('R5',0.6),'the guards\' camp; Wizzle is held here'],['ice cellars','area',[212,62],'Frostwick\'s dungeon'],['the fort','landmark',[166,62],'','L'],
  ['shipwreck','area',at('R6',0.65),'2 floors on the shore'],['lighthouse','landmark',[322,152],''],['island cave','area',[374,196],'by boat','L'],
  ['capital gate','gate',[172,161],'west; the guards take a bun','L'],['north gate','gate',[198,150],'shut after the Ordeal'],['east gate','gate',[210,164],'shut after the Ordeal'],
  ['flour tunnel','secret',[204,190],'under the bakery, out past the shut gates (act 3)'],
];

/* ---------------------------------------------------------------- the data */
/* map label side: 'L' puts the label to the left */
const data={size:{w:W,h:H,note:'tiles; was 600 × 340, shrunk after the P9 check'},towns:TOWNS,routes:R.map(r=>({id:r.id,from:r.from,to:r.to,steps:r.steps,length:r.length,straight:r.straight,land:r.land,open:r.open,points:r.points})),
  biomes:BIOMES,places:PLACES.map(([name,kind,[x,y],note])=>({name,kind,x,y,note}))};
fs.writeFileSync(path.join(__dirname,'..','docs','world-map.json'),JSON.stringify(data,null,1));

/* ---------------------------------------------------------------- the picture */
const S=2.4;   // pixels per tile in the picture
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W*S} ${H*S+150}" font-family="Trebuchet MS, Verdana, sans-serif">
<defs><filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
<pattern id="forest" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#2f6f34"/><circle cx="7" cy="7" r="5" fill="#24672d"/></pattern></defs>
<rect width="${W*S}" height="${H*S+150}" fill="#1d1238"/>
<rect x="0" y="0" width="${W*S}" height="${H*S}" fill="url(#forest)"/>
<g filter="url(#soft)">`;
for(const b of BIOMES)if(!b.sharp)for(const [x,y,rx,ry] of b.shapes)svg+=`<ellipse cx="${x*S}" cy="${y*S}" rx="${rx*S}" ry="${ry*S}" fill="${b.color}"/>`;
svg+=`</g>`;
for(const b of BIOMES)if(b.sharp)for(const [x,y,rx,ry] of b.shapes)svg+=`<ellipse cx="${x*S}" cy="${y*S}" rx="${rx*S}" ry="${ry*S}" fill="#e9d18b"/><ellipse cx="${x*S}" cy="${y*S}" rx="${rx*S*0.75}" ry="${ry*S*0.7}" fill="${b.color}"/>`;
// roads
for(const r of R){const d=r.points.map(([x,y],i)=>(i?'L':'M')+(x*S).toFixed(1)+' '+(y*S).toFixed(1)).join(' ');
  const boat=r.id==='R7';svg+=`<path d="${d}" fill="none" stroke="${boat?'#ffffff':'#7a4f27'}" stroke-width="${boat?3:7}" stroke-linecap="round" stroke-dasharray="${boat?'8 8':'none'}" opacity="0.95"/>`;
  if(!boat)svg+=`<path d="${d}" fill="none" stroke="#c9a36a" stroke-width="3" stroke-linecap="round"/>`;
  const m=r.points[Math.floor(r.points.length*0.5)];svg+=`<g transform="translate(${m[0]*S},${m[1]*S})"><rect x="-22" y="-13" width="44" height="22" rx="6" fill="#140a35" opacity="0.85"/><text x="0" y="3" font-size="13" fill="#ffd54a" text-anchor="middle" font-weight="bold">${r.id}</text></g>`}
// places
const ICON={area:['#140a35','▼'],landmark:['#4a35b0','★'],'field move':['#2f8f5a','➶'],extra:['#3a8fd9','♨'],barrier:['#c4523a','✕'],story:['#c4523a','!'],gate:['#62526d','▮'],secret:['#a8743f','⋯']};
for(const [name,kind,[x,y],note,side] of PLACES){const [c,ch]=ICON[kind];const L=side==='L';svg+=`<g transform="translate(${x*S},${y*S})"><circle r="9" fill="${c}" stroke="#fff" stroke-width="1.5"/><text y="4" font-size="11" fill="#fff" text-anchor="middle">${ch}</text><text x="${L?-12:12}" y="4" font-size="12" fill="#140a35" stroke="#fff" stroke-width="3" paint-order="stroke" text-anchor="${L?'end':'start'}">${esc(name)}</text></g>`}
// towns
for(const [k,t] of Object.entries(TOWNS)){const cap=t.kind==='capital';
  svg+=`<g transform="translate(${t.x*S},${t.y*S})"><circle r="${t.r*S*0.6}" fill="${cap?'#ffd54a':'#fff4d6'}" stroke="#140a35" stroke-width="4"/>${cap?`<path d="M-10 6 L-10 -6 L-5 -2 L0 -12 L5 -2 L10 -6 L10 6 Z" fill="#c4523a" stroke="#140a35" stroke-width="2"/>`:'<circle r="5" fill="#c4523a"/>'}
<text y="${-t.r*S*0.6-8}" font-size="${cap?20:17}" font-weight="bold" fill="#140a35" stroke="#fff" stroke-width="4" paint-order="stroke" text-anchor="middle">${esc(t.name)}</text>
<text y="${t.r*S*0.6+18}" font-size="12" fill="#140a35" stroke="#fff" stroke-width="3" paint-order="stroke" text-anchor="middle">levels ${esc(t.levels)}</text></g>`}
// title, compass, scale, legend
svg+=`<text x="20" y="34" font-size="26" font-weight="bold" fill="#ffd54a" stroke="#140a35" stroke-width="5" paint-order="stroke">Kobaldia</text>
<g transform="translate(${W*S-50},50)"><circle r="22" fill="#140a35" opacity="0.8"/><text y="-6" font-size="14" fill="#ffd54a" text-anchor="middle" font-weight="bold">N</text><path d="M0 -2 L6 14 L0 9 L-6 14 Z" fill="#ffd54a"/></g>
<g transform="translate(20,${H*S-22})"><rect width="${50*S}" height="6" fill="#ffd54a" stroke="#140a35"/><text y="-6" font-size="12" fill="#fff" stroke="#140a35" stroke-width="3" paint-order="stroke">50 tiles</text></g>`;
const ly=H*S+18;let lx=20;
svg+=`<text x="20" y="${ly+4}" font-size="14" font-weight="bold" fill="#ffd54a">Routes (steps · opens when)</text>`;
R.forEach((r,i)=>{svg+=`<text x="20" y="${ly+24+i*16}" font-size="12" fill="#fff"><tspan fill="#ffd54a" font-weight="bold">${r.id}</tspan> ${esc(TOWNS[r.from].name)} → ${esc(TOWNS[r.to].name)} · ${r.steps} · ${esc(r.land)} · ${esc(r.open)}</text>`});
const lx2=W*S*0.62;svg+=`<text x="${lx2}" y="${ly+4}" font-size="14" font-weight="bold" fill="#ffd54a">Marks</text>`;
Object.entries(ICON).forEach(([k,[c,ch]],i)=>{svg+=`<g transform="translate(${lx2+8},${ly+20+i*15})"><circle r="6" fill="${c}" stroke="#fff"/><text y="3" font-size="8" fill="#fff" text-anchor="middle">${ch}</text><text x="12" y="4" font-size="12" fill="#fff">${k}</text></g>`});
svg+=`</svg>`;
fs.writeFileSync(path.join(__dirname,'..','docs','world-map.svg'),svg);
console.log(R.map(r=>`${r.id}: ${r.length} steps (target ${r.steps}), straight ${r.straight}`).join('\n'));
