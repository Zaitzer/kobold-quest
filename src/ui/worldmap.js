/* The world map on the inn wall (room tile m): bump into it to see the whole region with its towns, route numbers
   and where you are. The picture is painted once from the world grid, one pixel per tile. */
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {OLD_H,OLD_W,WH,WW,makeWorldGrid,nameRoutes,overworldArea,sites} from '../data/overworld.js';
import {RP_DOORS} from '../data/places.js';
import {rpBuildWorld,rpWorldExtras} from '../data/world.js';
import {esc2} from '../engine/util.js';
import {rpUI} from './hud.js';

const WM_COL={'.':'#79c35a',',':'#4f9a3c',F:'#8fd06a',';':'#3f7f3a',T:'#24672d','~':'#3a8fd9',b:'#a0703c',j:'#a0703c','=':'#dcc08f','#':'#6a5a73',
  H:'#c4523a',d:'#c4523a',z:'#ecd48c',q:'#d8c27a',v:'#f2f6fb',P:'#3d7a5a',u:'#ad9f8a',C:'#3d3247',g:'#3d3247',c:'#3d3247',n:'#79c35a',i:'#79c35a',O:'#79c35a',
  K:'#6b5a86',W:'#8c88a6',X:'#8c88a6',S:'#79c35a',N:'#79c35a',A:'#79c35a',M:'#79c35a'};
const wm={img:null};
function wmImage(){if(wm.img!=null)return wm.img;if(rp.headless)return wm.img='';
  const old=rpBuildWorld();rpWorldExtras(old);const g=makeWorldGrid(old);
  const c=document.createElement('canvas');c.width=WW;c.height=WH;const x=c.getContext('2d'),im=x.createImageData(WW,WH),D=im.data,rgb={};
  for(const k in WM_COL){const h=WM_COL[k];rgb[k]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
  for(let y=0;y<WH;y++){const row=g[y];for(let xx=0;xx<WW;xx++){const p=rgb[row[xx]]||rgb['.'],i=(y*WW+xx)*4;D[i]=p[0];D[i+1]=p[1];D[i+2]=p[2];D[i+3]=255}}
  x.putImageData(im,0,0);return wm.img=c.toDataURL()}
/* where Pip is on the world: outside it is Pip's spot, inside a room it is that room's door */
function wmWhere(){const s=rp.s;if(!s.place)return{x:s.x,y:s.y};const d=Object.keys(RP_DOORS).find(k=>RP_DOORS[k]===s.place);
  if(!d)return{x:7,y:23};const [x,y]=d.split(',').map(Number);return{x,y}}
const pct=(x,y)=>'left:'+((x+.5)/WW*100).toFixed(2)+'%;top:'+((y+.5)/WH*100).toFixed(2)+'%';
function wmHtml(){const me=wmWhere();let h='<div class="wmap"><div class="wmapbox"><img alt="Map of the world" src="'+wmImage()+'">';
  const T=sites();for(const r of nameRoutes().list){/* the route's block farthest from any town, so numbers and names don't overlap */
    const far=([c,rr])=>Math.min(...T.map(t=>Math.hypot(t.x-c*10-5,(t.y-rr*10-5)*1.6)));const [c,rr]=r.cells.reduce((a,b)=>far(b)>far(a)?b:a);h+='<i class="wmr" style="'+pct(c*10+5,rr*10+5)+'">'+r.name.replace('Route ','')+'</i>'}
  for(const t of T)h+='<i class="wmt" style="'+pct(t.x,t.y)+'"><b></b>'+esc2(t.name)+'</i>';
  h+='<i class="wmyou" style="'+pct(me.x,me.y)+'"></i></div></div>';
  return h+'<div class="tbar"><p class="rptip">You are in <b>'+esc2(me.x<OLD_W&&me.y<OLD_H?'the Burrowhome valley':overworldArea(me.x,me.y))+'</b>. Numbers are routes.</p><button class="rpb x" type="button" data-rp="wmclose">Close</button></div>'}
function rpOpenWorldMap(){rp.mode='worldmap';rp.path=null;rp.held=null;rpUI(true)}
feature({id:'worldmap',
  panels:{worldmap:{sig:()=>rp.s.place+'|'+rp.s.x+','+rp.s.y,html:wmHtml}},
  actions:{wmclose:()=>{rp.mode='map'}},
  tiles:{m:{use:()=>rpOpenWorldMap()}}});
export {WM_COL,pct,rpOpenWorldMap,wm,wmHtml,wmImage,wmWhere};
