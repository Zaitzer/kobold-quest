/* Test hooks (only in the test build): the same window handles the old test scripts use. */
import {rpBattle} from '../battle/flow.js';
import {rpTacBtn,rpTacTap} from '../battle/input.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {registry} from './registry_view.js';
import {sprite} from '../engine/sprites.js';
import {rpSay} from '../game/dialogue.js';
import {rpTalk} from '../game/npcs.js';
import {rpEnterPlace} from '../game/world.js';
import {net,netBtn} from '../net/core.js';
import {rpFight} from '../net/lobby.js';
import {rpHeroOpen} from '../ui/hero.js';
import {rpUI} from '../ui/hud.js';

export function installHooks(){
  window.__rp=rp;
  window.__rpB={battle:(k,o)=>rpBattle(k,o),tap:(x,y)=>{rpTacTap(x,y);rpUI(true)},btn:d=>{rpTacBtn(d);rpUI(true)}};
  window.__net=net;window.__rpF=(k,o)=>rpFight(k,o);window.__netBtn=d=>{netBtn(d);rpUI(true)};window.__rpS=()=>rpSave();
  window.__kq={talk:rpTalk,say:rpSay,hero:rpHeroOpen,enter:rpEnterPlace,registry,sprite};
}
