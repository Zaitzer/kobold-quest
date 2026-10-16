/* item icons, drawn with the game's own weapon and hat art */
import {RP_IT} from '../data/items.js';
import {OL,ctx,drawHat,drawWeapon,set_ctx} from '../engine/art.js';

function rpIcon(c,id,sz){
  id=String(id).split('#')[0];const it=RP_IT[id];sz=sz||40;const d=Math.min(2,window.devicePixelRatio||1);c.width=Math.round(sz*d);c.height=Math.round(sz*d);c.style.width=sz+'px';c.style.height=sz+'px';
  const g=c.getContext('2d');if(!it||!g.setTransform)return;const main=ctx;set_ctx(g);g.setTransform(d*sz/40,0,0,d*sz/40,0,0);g.lineCap='round';g.lineJoin='round';
  const s=it.slot;
  if(s==='weapon'){g.save();g.translate(20,31);g.rotate(.62);g.scale(1.15,1.15);drawWeapon(it.w);g.restore()}
  else if(s==='head'){g.save();g.translate(19,62);g.scale(1.25,1.25);drawHat(it.hat);g.restore()}
  else if(s==='ring'){const col={rg_might:'#ff6b6b',rg_life:'#7ad67a',rg_mana:'#6fb8ff',rg_haste:'#ffe27a'}[id]||'#fff';g.strokeStyle=OL;g.lineWidth=7;g.beginPath();g.arc(20,24,9,0,7);g.stroke();g.strokeStyle='#ffd54a';g.lineWidth=4;g.beginPath();g.arc(20,24,9,0,7);g.stroke();g.fillStyle=col;g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(20,8);g.lineTo(26,14);g.lineTo(20,19);g.lineTo(14,14);g.closePath();g.fill();g.stroke()}
  else if(s==='neck'){g.strokeStyle='#ffd54a';g.lineWidth=2;g.beginPath();g.moveTo(9,6);g.quadraticCurveTo(20,26,31,6);g.stroke();const col={am_glow:'#7dffc4',am_shell:'#f0c48a',am_tooth:'#fff7e0'}[id];g.fillStyle=col;g.strokeStyle=OL;g.lineWidth=2;
    if(id==='am_tooth'){g.beginPath();g.moveTo(14,20);g.lineTo(26,20);g.lineTo(20,36);g.closePath();g.fill();g.stroke()}else{g.beginPath();g.arc(20,26,8,0,7);g.fill();g.stroke();if(id==='am_shell'){g.beginPath();g.arc(20,26,4,0,5);g.stroke()}}}
  else if(s==='cloak'){const col={cl_moss:'#5a9a3a',cl_shadow:'#3a2f55',cl_ember:'#d9532a'}[id];g.fillStyle=col;g.strokeStyle=OL;g.lineWidth=2.5;g.beginPath();g.moveTo(12,6);g.lineTo(28,6);g.lineTo(34,34);g.quadraticCurveTo(20,30,6,34);g.closePath();g.fill();g.stroke();g.fillStyle='#ffd54a';g.beginPath();g.arc(20,8,3,0,7);g.fill()}
  else if(s==='armor'){const col={ar_vest:'#a0703c',ar_robe:'#7a62e8',ar_scale:'#8fa4b8',ar_gorb:'#d96a8a'}[id];g.fillStyle=col;g.strokeStyle=OL;g.lineWidth=2.5;g.beginPath();g.moveTo(8,10);g.lineTo(15,6);g.quadraticCurveTo(20,11,25,6);g.lineTo(32,10);g.lineTo(29,18);g.lineTo(28,34);g.lineTo(12,34);g.lineTo(11,18);g.closePath();g.fill();g.stroke();
    if(id==='ar_scale'||id==='ar_gorb'){g.strokeStyle='rgba(20,10,53,.5)';g.lineWidth=1.5;for(let y=16;y<33;y+=5){g.beginPath();g.moveTo(13,y);g.lineTo(27,y);g.stroke()}}if(id==='ar_gorb'){g.fillStyle='#fff';[[16,14],[24,20],[18,27]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,2,0,7);g.fill()})}}
  else if(s==='shield'){
    if(id==='sh_tome'){g.fillStyle='#7a3a9a';g.strokeStyle=OL;g.lineWidth=2.5;g.fillRect(9,8,22,26);g.strokeRect(9,8,22,26);g.fillStyle='#ffd54a';g.fillRect(9,8,4,26);g.beginPath();g.arc(22,21,4,0,7);g.fill()}
    else if(id==='sh_quiver'){g.fillStyle='#8a5a30';g.strokeStyle=OL;g.lineWidth=2.5;g.beginPath();g.moveTo(13,12);g.lineTo(27,12);g.lineTo(25,36);g.lineTo(15,36);g.closePath();g.fill();g.stroke();g.strokeStyle='#e5ecf5';g.lineWidth=2;[[16,4],[20,2],[24,4]].forEach(([x,y])=>{g.beginPath();g.moveTo(x,12);g.lineTo(x,y);g.stroke()})}
    else{g.fillStyle=id==='sh_spike'?'#8fa4b8':'#98a1b2';g.strokeStyle=OL;g.lineWidth=2.5;g.beginPath();g.arc(20,21,13,0,7);g.fill();g.stroke();g.fillStyle='#6f7889';g.beginPath();g.arc(20,21,4,0,7);g.fill();if(id==='sh_spike'){g.fillStyle='#e5ecf5';[[20,6],[34,21],[20,36],[6,21]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,2.5,0,7);g.fill()})}}}
  else if(s==='boots'){const col={bt_frog:'#7ad65a',bt_quick:'#ff8a5c',bt_iron:'#8fa4b8'}[id];g.fillStyle=col;g.strokeStyle=OL;g.lineWidth=2.5;[[6,0],[19,4]].forEach(([x,yo])=>{g.beginPath();g.moveTo(x+2,8+yo);g.lineTo(x+10,8+yo);g.lineTo(x+10,24+yo);g.lineTo(x+15,26+yo);g.lineTo(x+15,31+yo);g.lineTo(x+2,31+yo);g.closePath();g.fill();g.stroke()})}
  set_ctx(main);
}
export {rpIcon};
