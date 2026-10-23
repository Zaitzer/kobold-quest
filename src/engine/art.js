import {drawSheet} from './sheets6.js';
import {drawCharSprite,sprite} from './sprites.js';
import {R,clamp,eob,heartPath,rr,starPath} from './util.js';
let ctx=null;let selected=null;
const TEAMS=[
  {name:'Embers',   body:'#f0673c',dark:'#b2431f',belly:'#ffd7a6',acc:'#ffb347'},
  {name:'Mossbacks',body:'#86c95f',dark:'#4f9040',belly:'#eaf5bd',acc:'#c4ee96'},
  {name:'Frosties', body:'#5ec6dc',dark:'#2f8ca6',belly:'#e0f7fc',acc:'#a6e8f6'},
  {name:'Grapes',   body:'#ac86ec',dark:'#7653bb',belly:'#efe3ff',acc:'#d2bcff'}
];
const WEAPONS={
  stick:{n:'Stick',w:'a stick',dmg:[3,6],cd:.85,wind:.26,range:28,say:'bonk!'},
  spoon:{n:'Big spoon',w:'a big spoon',dmg:[2,5],cd:.6,wind:.18,range:27,say:'boop!'},
  sword:{n:'Tiny sword',w:'a tiny sword',dmg:[4,8],cd:1.05,wind:.32,range:32,say:'shing!'},
  pan:{n:'Frying pan',w:'a frying pan',dmg:[3,6],cd:.95,wind:.3,range:28,say:'clang!',stun:true},
  bone:{n:'Bone',w:'a bone',dmg:[3,7],cd:.8,wind:.24,range:29,say:'thwack!'},
  fish:{n:'Fish',w:'a fish',dmg:[2,4],cd:.55,wind:.16,range:28,say:'slap!'},
  popgun:{n:'Pop gun',w:'a pop gun',dmg:[2,4],cd:1.1,wind:.2,range:125,say:'pop!',ranged:true,proj:'cork',spd:300},
  blunder:{n:'Blunderbuss',w:'a blunderbuss',dmg:[2,4],cd:1.5,wind:.4,range:115,say:'BOOM!',ranged:true,proj:'pellet',spd:260,spread:3},
  squirt:{n:'Water pistol',w:'a water pistol',dmg:[1,2],cd:.5,wind:.1,range:105,say:'splat!',ranged:true,proj:'water',spd:280},
  firewand:{n:'Fire wand',w:'a fire wand',dmg:[4,7],cd:1.3,wind:.35,range:130,say:'FWOOSH!',ranged:true,magic:true,proj:'fire',spd:200,aoe:32},
  frostrod:{n:'Frost staff',w:'a frost staff',dmg:[2,4],cd:1.0,wind:.3,range:140,say:'brr!',ranged:true,magic:true,proj:'ice',spd:240,slow:true},
  club:{n:'Great club',w:'a great club',dmg:[6,11],cd:1.1,wind:.36,range:35,say:'WHUMP!'},
  cannon:{n:'Hand cannon',w:'a hand cannon',dmg:[8,13],cd:2.3,wind:.5,range:150,say:'KABOOM!',ranged:true,proj:'pellet',spd:300},
  archstaff:{n:'Archmage staff',w:'an archmage staff',dmg:[7,11],cd:1.7,wind:.4,range:150,say:'KRAKOOM!',ranged:true,magic:true,proj:'fire',spd:220,aoe:46},
  healwand:{n:'Heal wand',w:'a heal wand',dmg:[1,2],cd:2.0,wind:.3,range:150,say:'sparkle!',ranged:true,magic:true,heal:true,spd:230},
  spear:{n:'Spear',w:'a spear',dmg:[4,7],cd:1,wind:.3,range:40,say:'poke!'}
};
const FAC=[
  {hp:.97,dmg:1.1,dmgBrawl:1,spd:1,magCd:1,chill:0,shroom:1,disc:{firewand:2}},
  {hp:1.07,dmg:1,dmgBrawl:1,spd:.93,magCd:1,chill:0,shroom:1.5,disc:{bone:1,healwand:3}},
  {hp:1.03,dmg:.95,dmgBrawl:1,spd:1,magCd:1,chill:.4,shroom:1,disc:{squirt:1}},
  {hp:1,dmg:1,dmgBrawl:.95,spd:1,magCd:.9,chill:0,shroom:1,disc:{magician:2}}
];
function makeK(e,x,y,pop){
  const k={e,team:e.team,name:e.name,art:e.art||null,weapon:e.weapon,W:WEAPONS[e.weapon],hat:e.hat,pers:e.pers,
    x,y,kx:0,ky:0,z:0,vz:0,hp:e.cur!=null?e.cur:e.hp,max:e.hp,size:e.size||1,dmgMul:(e.dmgMul||1)*FAC[e.team].dmg*(WEAPONS[e.weapon].ranged?1:FAC[e.team].dmgBrawl),spd:(e.speed||1)*FAC[e.team].spd,cdMul:WEAPONS[e.weapon].magic?FAC[e.team].magCd:1,chill:Math.max(FAC[e.team].chill,e.chill||0),boss:!!e.boss,face:x<240?1:-1,state:'idle',st:0,cd:R(0,.6),stun:0,hurt:0,happy:0,munch:0,
    target:null,retarget:0,wander:{x,y,t:0,wait:0},phase:R(0,6),bob:R(0,6),walk:0,moving:false,pop:pop?0:1,kos:0,
    fleeT:0,fleeCd:0,slow:0,squash:0,rot:0,rotT:0,koT:0,dead:false,blink:R(2,5),wa:.35,t:0,
    dmgDone:0,dmgTaken:0,healDone:0,koAt:-1,regen:0,regenT:0,focus:null,focusT:0,focusMark:0,fx:{},perk:e.perk||null};
  (e.fx||[]).forEach(f=>{k.fx[f]=1});
  if(e.pers==='scaredy'&&e.lvl)k.spd*=1.15;
  if(k.perk==='sniper')k.W=Object.assign({},k.W,{range:Math.round(k.W.range*1.25)});
  if(k.perk==='rapid')k.cdMul*=.8;
  if(k.perk==='swift'){k.spd*=1.2;k.cdMul*=.9}
  return k;
}
function el(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill()}
function handPos(wa){
  if(wa<.35){const t=clamp((wa+.6)/.95,0,1);return[16-3*t,-23+12*t]}
  const t=clamp((wa-.35)/1.25,0,1);return[13+5*t,-11+t];
}
function drawWeapon(name){
  ctx.lineCap='round';
  if(name==='stick'){
    ctx.strokeStyle='#9a6b3f';ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,-18);ctx.stroke();
    el(0,-19,3.2,3,'#8a5a30');
  }else if(name==='spoon'){
    ctx.strokeStyle='#c9ced8';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,-12);ctx.stroke();
    ctx.fillStyle='#e2e6ee';ctx.strokeStyle='#9aa1af';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,-17,4.8,6.4,0,0,7);ctx.fill();ctx.stroke();
  }else if(name==='sword'){
    ctx.fillStyle='#e5ecf5';ctx.beginPath();ctx.moveTo(-2.2,-6);ctx.lineTo(-2.2,-21);ctx.lineTo(0,-25);ctx.lineTo(2.2,-21);ctx.lineTo(2.2,-6);ctx.closePath();ctx.fill();
    ctx.fillStyle='#e0a63a';ctx.fillRect(-5.5,-7,11,2.8);
    ctx.strokeStyle='#7a4a2a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(0,3);ctx.stroke();
  }else if(name==='pan'){
    ctx.strokeStyle='#4a4452';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,-8);ctx.stroke();
    el(0,-15,7.6,7.6,'#2e2a35');el(0,-15,6,6,'#625c70');
  }else if(name==='bone'){
    ctx.strokeStyle='#f4ead2';ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(0,3);ctx.lineTo(0,-16);ctx.stroke();
    ctx.fillStyle='#f4ead2';[[-2,-18],[2,-18],[-2,4],[2,4]].forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],2.7,0,7);ctx.fill()});
  }else if(name==='firewand'){
    ctx.strokeStyle='#7a4a2a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(0,-14);ctx.stroke();
    el(0,-18,4.6,4.6,'#ff8a2b');el(0,-18,2.6,2.6,'#ffd777');
  }else if(name==='frostrod'){
    ctx.strokeStyle='#9fc6e8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,6);ctx.lineTo(0,-15);ctx.stroke();
    ctx.fillStyle='#cfefff';ctx.strokeStyle='#7fc4ec';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(4.4,-20);ctx.lineTo(0,-13);ctx.lineTo(-4.4,-20);ctx.closePath();ctx.fill();ctx.stroke();
  }else if(name==='healwand'){
    ctx.strokeStyle='#fff0f5';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(0,-14);ctx.stroke();
    ctx.fillStyle='#ff7aa8';heartPath(ctx,0,-19,5.2);ctx.fill();
  }else if(name==='spear'){
    ctx.strokeStyle='#8a5a30';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(0,-26);ctx.stroke();
    ctx.fillStyle='#e5ecf5';ctx.strokeStyle='#8f97a8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-36);ctx.lineTo(3.6,-26);ctx.lineTo(-3.6,-26);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#ff6b6b';ctx.fillRect(-2.4,-25,4.8,2.4);
  }else if(name==='popgun'){
    ctx.fillStyle='#8a5a30';rr(ctx,0,-4,8,4.4,1.6);ctx.fill();
    ctx.fillStyle='#4fb8c9';rr(ctx,-3.2,-12,6.4,11,2);ctx.fill();
    ctx.fillStyle='#d9d3e0';ctx.fillRect(-2,-18,4,7);
    el(0,-19.2,2.4,2,'#d9a066');
  }else if(name==='blunder'){
    ctx.fillStyle='#8a5a30';rr(ctx,0,-4,9,4.6,1.6);ctx.fill();
    ctx.fillStyle='#b9822e';rr(ctx,-2.6,-12,5.2,10,2);ctx.fill();
    ctx.fillStyle='#d9a83f';ctx.beginPath();ctx.moveTo(-2,-11);ctx.lineTo(-6.6,-22);ctx.lineTo(6.6,-22);ctx.lineTo(2,-11);ctx.closePath();ctx.fill();
    ctx.fillStyle='#4a2f12';ctx.beginPath();ctx.ellipse(0,-22,6,1.8,0,0,7);ctx.fill();
    ctx.fillStyle='#7a5416';ctx.fillRect(-3,-9,6,1.8);
  }else if(name==='squirt'){
    ctx.fillStyle='#ffd54a';rr(ctx,0,-4,7,4.4,1.6);ctx.fill();
    ctx.fillStyle='#4aa3ff';rr(ctx,-3.6,-14,7.2,13,2.4);ctx.fill();
    el(5,-8,4.4,4.4,'#a9dcff');el(5,-8,2.2,2.2,'#e6f5ff');
    ctx.fillStyle='#ffd54a';ctx.fillRect(-1.6,-19,3.2,6);
  }else if(name==='club'){
    ctx.strokeStyle='#7a4a2a';ctx.lineWidth=4.6;ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(0,-14);ctx.stroke();
    el(0,-21,7.4,9,'#8a5a30');el(0,-21,5.6,7.2,'#a46d3a');
    [[-3,-24],[3,-24],[0,-18],[-3,-19]].forEach(q=>el(q[0],q[1],1.3,1.3,'#d8d2c4'));
  }else if(name==='cannon'){
    ctx.save();ctx.scale(1.3,1.3);drawWeapon('blunder');ctx.restore();
    el(0,-27,2.3,2.3,'#ffd54a');
  }else if(name==='archstaff'){
    ctx.save();ctx.scale(1.25,1.25);
    ctx.strokeStyle='#5a3d99';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(0,6);ctx.lineTo(0,-16);ctx.stroke();
    el(0,-20,6,6,'#ff6a1f');el(0,-20,3.6,3.6,'#ffd777');el(0,-20,1.6,1.6,'#fff');
    ctx.restore();
  }else if(name==='fish'){
    ctx.fillStyle='#4f93c4';ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo(-4.5,-6);ctx.lineTo(4.5,-6);ctx.closePath();ctx.fill();
    el(0,-13,5,8.6,'#6fb3e0');el(1,-11.5,2.6,5.6,'#bfe3f7');
    el(-1.6,-18,1.5,1.5,'#fff');el(-1.6,-18,.7,.7,'#1d1a28');
  }
}
function drawHat(h){
  if(h==='pot'){
    ctx.fillStyle='#98a1b2';ctx.beginPath();ctx.arc(1,-38,9,Math.PI,0);ctx.closePath();ctx.fill();
    ctx.fillStyle='#6f7889';ctx.fillRect(-9,-38.5,20,2.6);el(1,-47.4,1.8,1.6,'#6f7889');
  }else if(h==='bucket'){
    ctx.fillStyle='#7da1c9';ctx.beginPath();ctx.moveTo(-6,-48);ctx.lineTo(8,-48);ctx.lineTo(10,-38);ctx.lineTo(-8,-38);ctx.closePath();ctx.fill();
    ctx.fillStyle='#5b81ad';ctx.fillRect(-8,-41,18,2.2);
  }else if(h==='cone'){
    ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.moveTo(1,-55);ctx.lineTo(9,-38);ctx.lineTo(-7,-38);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff3e0';ctx.beginPath();ctx.moveTo(-4.65,-43);ctx.lineTo(6.65,-43);ctx.lineTo(4.76,-47);ctx.lineTo(-2.76,-47);ctx.closePath();ctx.fill();
    ctx.fillStyle='#e8701a';ctx.fillRect(-9,-39,20,2);
  }else if(h==='leaf'){
    ctx.strokeStyle='#4f9040';ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(1,-39);ctx.lineTo(3,-45);ctx.stroke();
    ctx.save();ctx.translate(5.5,-47);ctx.rotate(-.5);el(0,0,6.4,3.2,'#8be16c');
    ctx.strokeStyle='#5ab34a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.stroke();ctx.restore();
  }else if(h==='wizard'){
    ctx.fillStyle='#5a3d99';ctx.beginPath();ctx.ellipse(1,-38.5,13.5,3.2,0,0,7);ctx.fill();
    ctx.fillStyle='#6c4bb8';ctx.beginPath();ctx.moveTo(-7,-39);ctx.quadraticCurveTo(-1,-52,8,-60);ctx.quadraticCurveTo(10,-50,9,-39);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffd54a';ctx.fillRect(-7.2,-42.4,16.6,2.4);
    ctx.fillStyle='#ffe27a';starPath(ctx,2.5,-48,2.6,0);ctx.fill();
  }else if(h==='crown'){
    ctx.fillStyle='#ffd54a';ctx.beginPath();ctx.moveTo(-8,-38);ctx.lineTo(-8,-48);ctx.lineTo(-4,-43);ctx.lineTo(1,-50);ctx.lineTo(6,-43);ctx.lineTo(10,-48);ctx.lineTo(10,-38);ctx.closePath();ctx.fill();
    ctx.fillStyle='#e0a63a';ctx.fillRect(-8,-40.4,18,2.4);
    el(1,-44.4,1.3,1.3,'#ff5a7a');el(-4,-41.6,.9,.9,'#6fd3ee');el(6,-41.6,.9,.9,'#6fd3ee');
  }else if(h==='flower'){
    for(let i=0;i<5;i++){const a=i*1.2566;el(8+Math.cos(a)*3.1,-40+Math.sin(a)*3.1,2.5,2.5,'#ff9ec7')}
    el(8,-40,1.9,1.9,'#ffe066');
  }
}
const OL='#140a35';
function drawKobold(k){
  const T=TEAMS[k.team],ko=k.state==='ko',pop=k.pop<1?eob(k.pop):1;
  const zf=Math.max(.25,1-k.z/90),lying=ko&&k.z<2;
  ctx.fillStyle='rgba(10,5,16,'+(.38*zf).toFixed(3)+')';
  ctx.beginPath();ctx.ellipse(k.x,k.y+1,(lying?18:13)*k.size*zf*pop,(lying?5.2:4.5)*k.size*zf*pop,0,0,7);ctx.fill();
  if(selected===k){
    ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.ellipse(k.x,k.y+1,19,7,0,0,7);ctx.stroke();ctx.setLineDash([]);
  }
  const flash=k.hurt>0&&((k.hurt*40)|0)%2===0;
  const c=flash?'#ffffff':T.body,d=T.dark,b=T.belly;
  const atk=k.state==='windup'||k.state==='strike';
  const scared=!ko&&(k.fleeT>0||(k.pers==='scaredy'&&k.hp<k.max*.35));
  const happy=!ko&&(k.state==='cheer'||k.happy>0||k.munch>0);
  const moving=k.moving&&!ko,m=moving?1:0;
  const bob=ko?0:(moving?-Math.abs(Math.sin(k.walk))*2.4:Math.sin(k.t*3+k.bob)*.7);
  const sq=k.squash;
  ctx.save();
  ctx.translate(k.x+(k.hurt>0?Math.sin(k.hurt*90)*1.6:0),k.y-k.z);
  const sh=k.sheetFn&&k.sheetFn();   /* a drawn sheet has its own knocked-down frame, so it does not tip over */
  ctx.translate(0,-12);ctx.rotate(sh?0:k.rot);ctx.translate(0,12);
  ctx.scale(pop*(1+.2*sq)*k.face*k.size,pop*(1-.2*sq)*k.size);
  ctx.translate(0,bob);
  /* a drawing from art/sprites, if there is one for this character */
  const art=sprite(k.art);
  if(sh&&drawSheet(ctx,sh,k,{colour:k.colour6,map:k.onMap})){/* a v6 sheet (engine/sheets6.js) */}
  else if(art){if(lying)ctx.rotate(-1.35);if(flash)ctx.globalAlpha=.45;drawCharSprite(ctx,art,k.size);ctx.globalAlpha=1}
  else{
  ctx.lineCap='round';ctx.lineJoin='round';
  // tail
  const wag=Math.sin(k.t*(k.state==='cheer'?14:6)+k.phase)*(moving?5:3);
  const tcy=-4+wag*.3,tx=-34,ty=-14+wag*1.15;
  ctx.strokeStyle=OL;ctx.lineWidth=8.4;ctx.beginPath();ctx.moveTo(-8,-8);ctx.quadraticCurveTo(-22,tcy,tx+4,ty+.5);ctx.stroke();
  ctx.strokeStyle=ko?d:c;ctx.lineWidth=5.6;ctx.beginPath();ctx.moveTo(-8,-8);ctx.quadraticCurveTo(-22,tcy,tx+4,ty+.5);ctx.stroke();
  ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(-22,-6+wag*.2);ctx.quadraticCurveTo(-27,tcy-1,tx+4,ty+.5);ctx.stroke();
  ctx.fillStyle=d;
  [[-14,-6.6],[-20,-6+wag*.25],[-26,-7.5+wag*.5]].forEach(q=>{ctx.beginPath();ctx.moveTo(q[0]-2.4,q[1]-2.2);ctx.lineTo(q[0]+.4,q[1]-6);ctx.lineTo(q[0]+2.4,q[1]-2.4);ctx.closePath();ctx.fill()});
  ctx.save();ctx.translate(tx+4,ty+.5);ctx.rotate(Math.atan2(ty+.5-tcy,tx+4+22));
  ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(-3,-4.2);ctx.lineTo(-9,0);ctx.lineTo(-3,4.2);ctx.closePath();ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
  // feet
  const ph=k.walk,s1=Math.sin(ph)*m;
  el(-4+s1*3,-2-Math.max(0,Math.cos(ph))*2.5*m,6.6,4.6,OL);el(5-s1*3,-2-Math.max(0,-Math.cos(ph))*2.5*m,6.6,4.6,OL);
  el(-4+s1*3,-2-Math.max(0,Math.cos(ph))*2.5*m,5,3,d);
  el(5-s1*3,-2-Math.max(0,-Math.cos(ph))*2.5*m,5,3,d);
  ctx.fillStyle='#fff0d2';
  [-4+s1*3,5-s1*3].forEach((fx,fi)=>{const fy=-2-Math.max(0,fi?-Math.cos(ph):Math.cos(ph))*2.5*m;[0,1.9,3.8].forEach(o=>{ctx.beginPath();ctx.moveTo(fx+3.6+o*.3,fy-1.4+o*.4);ctx.lineTo(fx+6.2+o*.3,fy+.2+o*.5);ctx.lineTo(fx+3.6+o*.3,fy+1.3+o*.4);ctx.closePath();ctx.fill()})});
  // body
  ctx.fillStyle=d;
  [[-8.5,-19.6],[-11.2,-14.2],[-10,-8.6]].forEach(q=>{ctx.beginPath();ctx.moveTo(q[0]+3,q[1]-2.6);ctx.lineTo(q[0]-3.2,q[1]-.4);ctx.lineTo(q[0]+3,q[1]+2.4);ctx.closePath();ctx.fill()});
  el(0,-12,12.7,11.7,OL);
  el(0,-12,11,10,c);el(2,-10.5,6.6,7,b);
  ctx.strokeStyle='rgba(60,25,40,.16)';ctx.lineWidth=1;
  [-15,-12,-9].forEach(yy=>{ctx.beginPath();ctx.moveTo(-1.6,yy);ctx.quadraticCurveTo(3,yy+1.2,7,yy);ctx.stroke()});
  el(-6,-16,1.4,1.1,d);el(-4,-9.5,1.3,1,d);el(-7,-12,1.2,1,d);
  // frill and horns
  const ew=Math.sin(k.t*4+k.phase)*1.2,droop=(k.hurt>0||scared||ko)?7:0;
  ctx.fillStyle=d;ctx.strokeStyle=OL;ctx.lineWidth=2.4;
  ctx.beginPath();ctx.moveTo(-8,-33);ctx.lineTo(-20,-39+droop*.8+ew);ctx.lineTo(-10,-27);ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-9,-28);ctx.lineTo(-23,-30+droop*.6+ew*.6);ctx.lineTo(-10.5,-22);ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-8,-24);ctx.lineTo(-19,-21+droop*.3);ctx.lineTo(-7,-19);ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-8,-33);ctx.lineTo(-20,-39+droop*.8+ew);ctx.lineTo(-10,-27);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(-9,-28);ctx.lineTo(-23,-30+droop*.6+ew*.6);ctx.lineTo(-10.5,-22);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(-8,-24);ctx.lineTo(-19,-21+droop*.3);ctx.lineTo(-7,-19);ctx.closePath();ctx.fill();
  ctx.fillStyle=c;
  ctx.beginPath();ctx.moveTo(-8.5,-31.5);ctx.lineTo(-16.5,-35.4+droop*.7+ew);ctx.lineTo(-9.4,-28);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(-9.4,-27);ctx.lineTo(-18.5,-28.3+droop*.5+ew*.6);ctx.lineTo(-10,-23.4);ctx.closePath();ctx.fill();
  if(k.hat==='none'||k.hat==='leaf'||k.hat==='flower'){
    ctx.strokeStyle=OL;ctx.lineWidth=2.6;ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(-9,-35.5);ctx.quadraticCurveTo(-8,-46,-19.5,-49);ctx.quadraticCurveTo(-12.4,-41.5,-2.6,-36.5);ctx.closePath();ctx.stroke();
    ctx.beginPath();ctx.moveTo(.4,-37.6);ctx.quadraticCurveTo(1.6,-48,-9,-51.4);ctx.quadraticCurveTo(-2.6,-43.6,7.4,-37.4);ctx.closePath();ctx.stroke();
    ctx.fillStyle='#fff0d2';
    ctx.beginPath();ctx.moveTo(-9,-35.5);ctx.quadraticCurveTo(-8,-46,-19.5,-49);ctx.quadraticCurveTo(-12.4,-41.5,-2.6,-36.5);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(.4,-37.6);ctx.quadraticCurveTo(1.6,-48,-9,-51.4);ctx.quadraticCurveTo(-2.6,-43.6,7.4,-37.4);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(120,80,50,.35)';
    ctx.beginPath();ctx.moveTo(-15.6,-47.4);ctx.lineTo(-19.5,-49);ctx.lineTo(-13.6,-44);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-5.5,-49.6);ctx.lineTo(-9,-51.4);ctx.lineTo(-3.8,-46);ctx.closePath();ctx.fill();
  }
  // head
  el(1,-28,14.5,12.7,OL);el(10,-25.4,10.5,7.5,OL);
  el(1,-28,12.8,11,c);
  el(10,-25.4,8.8,5.8,c);
  el(9.4,-22.6,7.4,3.3,b);
  el(-4.5,-35.4,1,1,d);el(-.5,-37.2,1,1,d);el(-8,-31,1.1,1,d);el(2.5,-34.5,.9,.9,d);
  el(17.6,-27.4,2.1,1.6,'#33202c');el(17,-27.9,.6,.5,'#ffffff');
  ctx.strokeStyle='rgba(40,20,30,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(14.4,-26.2);ctx.quadraticCurveTo(15.2,-25.4,16,-26.2);ctx.stroke();
  // mouth
  if(atk){
    el(11,-21.3,5.2,3.4,'#5a1a2a');el(11,-19.9,3.2,1.4,'#ff7a8a');
    ctx.fillStyle='#ffffff';
    [8,11.4,14.6].forEach(tx2=>{ctx.beginPath();ctx.moveTo(tx2-1.3,-23.6);ctx.lineTo(tx2+1.3,-23.6);ctx.lineTo(tx2,-21);ctx.closePath();ctx.fill()});
  }else if(k.munch>0){const o=Math.sin(k.munch*32)>0?2.6:.8;el(11,-21.7,4.4,o,'#5a1a2a')}
  else if(ko){el(11,-20.4,3.4,2,'#ff8a9a');ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(8.6,-23);ctx.lineTo(10.4,-23);ctx.lineTo(9.5,-20.6);ctx.closePath();ctx.fill()}
  else{
    ctx.strokeStyle='#4a2a38';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(4.2,-22.6);ctx.quadraticCurveTo(10.5,-20.2,17,-23.4);ctx.stroke();
    ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(9.4,-21.6);ctx.lineTo(11.6,-21.4);ctx.lineTo(10.6,-19);ctx.closePath();ctx.fill();
  }
  // eyes
  const ex=[-3,6.5],ey=-30;
  ctx.strokeStyle='#2c1a2a';ctx.lineWidth=1.8;
  if(ko){
    ex.forEach(x=>{ctx.beginPath();ctx.moveTo(x-2.6,ey-2.6);ctx.lineTo(x+2.6,ey+2.6);ctx.moveTo(x+2.6,ey-2.6);ctx.lineTo(x-2.6,ey+2.6);ctx.stroke()});
  }else if(k.hurt>0){
    ctx.beginPath();ctx.moveTo(ex[0]-2.5,ey-3);ctx.lineTo(ex[0]+2,ey);ctx.lineTo(ex[0]-2.5,ey+3);ctx.stroke();
    ctx.beginPath();ctx.moveTo(ex[1]+2.5,ey-3);ctx.lineTo(ex[1]-2,ey);ctx.lineTo(ex[1]+2.5,ey+3);ctx.stroke();
  }else if(happy){
    ex.forEach(x=>{ctx.beginPath();ctx.moveTo(x-3,ey+1.6);ctx.quadraticCurveTo(x,ey-4,x+3,ey+1.6);ctx.stroke()});
  }else if(k.blink<0){
    ex.forEach(x=>{ctx.beginPath();ctx.moveTo(x-3,ey+.5);ctx.lineTo(x+3,ey+.5);ctx.stroke()});
  }else{
    let lkx=1,lky=0;const t=k.target;
    if(t&&t.state!=='ko'){const dx=t.x-k.x,dy=t.y-k.y,dd=Math.hypot(dx,dy)||1;lkx=dx/dd*k.face;lky=dy/dd}
    ex.forEach(x=>{
      ctx.fillStyle='#ffe27a';ctx.strokeStyle='rgba(44,26,42,.6)';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(x,ey,4.3,0,7);ctx.fill();ctx.stroke();
      const px=x+lkx*1.1,py=ey+lky*.9+.2;
      el(px,py,scared?.9:1.5,scared?2.7:3.4,'#2c1a2a');el(px-1.1,py-1.5,.9,.9,'#ffffff');
      ctx.strokeStyle=d;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(x-4.4,ey-2.6);ctx.quadraticCurveTo(x,ey-5.6,x+4.4,ey-3);ctx.stroke();
    });
  }
  if(atk){
    ctx.strokeStyle='#3a2030';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(-7.5,-36);ctx.lineTo(-1,-33.8);ctx.stroke();
    ctx.beginPath();ctx.moveTo(10.5,-36);ctx.lineTo(4,-33.8);ctx.stroke();
  }
  if(scared){
    const sy=-38+Math.sin(k.t*8);
    ctx.fillStyle='#8fd8ff';ctx.beginPath();ctx.moveTo(-14,sy-4);ctx.quadraticCurveTo(-18,sy+1,-14,sy+3);ctx.quadraticCurveTo(-10,sy+1,-14,sy-4);ctx.fill();
  }
  drawHat(k.hat);
  // arm + weapon
  if(!ko){
    const hp=handPos(k.wa);
    ctx.strokeStyle=OL;ctx.lineWidth=7.4;ctx.beginPath();ctx.moveTo(6,-15);ctx.lineTo(hp[0],hp[1]);ctx.stroke();
    ctx.strokeStyle=d;ctx.lineWidth=4.6;ctx.beginPath();ctx.moveTo(6,-15);ctx.lineTo(hp[0],hp[1]);ctx.stroke();
    ctx.save();ctx.translate(hp[0],hp[1]);ctx.rotate(k.wa);drawWeapon(k.weapon);ctx.restore();
    el(hp[0],hp[1],4.5,4.5,OL);el(hp[0],hp[1],2.9,2.9,c);
  }
  }
  ctx.restore();
  if(ko){
    for(let i=0;i<3;i++){
      const a=k.t*5+i*2.094,sx=k.x+Math.cos(a)*11,sy=k.y-k.z-30+Math.sin(a)*3.5;
      ctx.fillStyle='#ffe27a';starPath(ctx,sx,sy,3.3,a);ctx.fill();
    }
  }
  if(!ko&&k.slow>0){ctx.fillStyle='#bfeaff';starPath(ctx,k.x+16,k.y-k.z-40,3.8,k.t*3);ctx.fill()}
  if(!ko&&(k.hp<k.max||selected===k)){
    const bx=k.x-13,by=k.y-k.z-66*k.size,r=clamp(k.hp/k.max,0,1);
    ctx.fillStyle='rgba(15,8,22,.88)';rr(ctx,bx-1.5,by-1.5,29,7,3.5);ctx.fill();
    ctx.fillStyle=r>.5?'#7ad67a':r>.25?'#ffc857':'#ff6b6b';rr(ctx,bx,by,Math.max(2,26*r),4,2);ctx.fill();
  }
}
function set_ctx(v){return ctx=v}
export {FAC,OL,TEAMS,WEAPONS,ctx,drawHat,drawKobold,drawWeapon,el,handPos,makeK,selected,set_ctx};
