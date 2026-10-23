/* The game's frame: walking or fighting, drawing, the panel; Play opens the heroes screen (ui/chars6.js). */
import {rpDrawBattle} from '../battle/draw.js';
import {rpBattleStep} from '../battle/flow.js';
import {set_uiT,uiT} from '../core/app.js';
import {rpGoFull} from '../core/layout.js';
import {feature,frames} from '../core/registry.js';
import {rp} from '../core/state.js';
import {$} from '../engine/util.js';
import {rpMoveFrame} from './move.js';
import {rpDrawMap} from '../render/map.js';
import {openSelect} from '../ui/chars6.js';
import {rpUI} from '../ui/hud.js';

function rpFrame(dt){
  rp.t+=dt;
  if(rp.mode==='map')rpMoveFrame(dt);
  if(rp.mode==='battle')rpBattleStep(dt);
  if(rp.mode==='battle'&&rp.bt)rpDrawBattle();else rpDrawMap(dt);
  set_uiT(uiT+(dt));if(uiT>.15){set_uiT(0);rpUI()}
  for(const f of frames)f(dt);
}
feature({id:'game-play',init(){const b=typeof document!=='undefined'&&$('go-rpg');if(b)b.addEventListener('click',()=>{rpGoFull();openSelect()})}});
export {rpFrame};
