/* Test hooks (only in the test build): the same window handles the old test scripts use. */
import {rpBattle} from '../battle/flow.js';
import {rpTacBtn,rpTacTap} from '../battle/input.js';
import {tcMov,tcReach} from '../battle/rules.js';
import {v6FoeKey,v6Mix} from '../battle/v6battle.js';
import {rpSave} from '../core/save.js';
import {rp,rpNewState} from '../core/state.js';
import {registry} from './registry_view.js';
import {set_soundOn,sfx} from '../engine/audio.js';
import {rpMus} from '../engine/music.js';
import {sprite} from '../engine/sprites.js';
import {rpSay} from '../game/dialogue.js';
import {v6Piece} from '../game/items6.js';
import {rpSpecialAt,rpTapTile} from '../game/move.js';
import {MILL} from '../game/music6.js';
import {rpTalk} from '../game/npcs.js';
import {s6Npcs} from '../game/story6.js';
import {v6Kobold} from '../game/v6sheet.js';
import {rpBfs,rpEnterPlace,rpSolid} from '../game/world.js';
import {w6Go,w6Start} from '../game/world6.js';
import {net,netBtn} from '../net/core.js';
import {rpFight} from '../net/lobby.js';
import {rpHeroOpen} from '../ui/hero.js';
import {rpUI} from '../ui/hud.js';

export function installHooks(){
  window.__rp=rp;window.__kqOldTitle=!/[?&]v6\b/.test(location.search);   // the old browser scenarios play the first story; ?v6 opens the heroes screen
  window.__rpB={reach:()=>{const b=rp.bt,u=b.cur,R=tcReach(b,u,tcMov(u)),out=[];R.dist.forEach((d,k)=>{if(d>0)out.push([k%b.W,Math.floor(k/b.W),d])});return out},battle:(k,o)=>rpBattle(k,o),tap:(x,y)=>{rpTacTap(x,y);rpUI(true)},btn:d=>{rpTacBtn(d);rpUI(true)}};
  window.__net=net;window.__rpF=(k,o)=>rpFight(k,o);window.__netBtn=d=>{netBtn(d);rpUI(true)};window.__rpS=()=>rpSave();
  window.__kq={talk:rpTalk,say:rpSay,hero:rpHeroOpen,enter:rpEnterPlace,registry,sprite};
  window.__w6go=(p,x,y)=>{w6Go(p,x,y);rpUI(true)};
  /* v6 shortcuts for the co-op test: a ready pack in the world (past Hearthspire's morning, so not phased), and a fight from the first road's mix */
  window.__v6={pack:(list,opt)=>{if(!rp.s)rp.s=rpNewState();w6Start(list.map((x,i)=>v6Kobold(x[0],x[1],x[2],{hero:i===0?1:0})),opt);rp.s.q.act=rp.s.q.act||7;rpUI(true)},
    mill:MILL,tile:(x,y)=>{rpTapTile(x,y);rpUI(true)},solid:(x,y)=>rpSolid(x,y),bfs:(x,y,n)=>rpBfs(x,y,n),special:(x,y)=>rpSpecialAt(x,y),npc:id=>s6Npcs().find(n=>id?n.id===id:!n.shop),piece:(slot,tier)=>v6Piece(slot,tier||0),
    find:ch=>{for(let y=0;y<rp.grid.length;y++)for(let x=0;x<rp.grid[y].length;x++)if(rp.grid[y][x]===ch)return[x,y];return null},
    fight:keys=>{rpFight(keys?keys.map(k=>Array.isArray(k)?v6FoeKey(k[0],k[1]):k):v6Mix(0),{members:rp.s.party.map(m=>({m,ctl:'me',own:'h'})),zone:',',v6:1,theme:'meadow',title:'Road fight'});rpUI(true)}};
  window.__kqA={on:()=>set_soundOn(true),sfx,music:()=>({key:rpMus.key,lvl:rpMus.lvl,outdoor:rpMus.outdoor,amb:rpMus.amb})};
}
