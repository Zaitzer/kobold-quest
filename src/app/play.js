/* The game's frame: walking or fighting, drawing, the panel; Play opens the heroes screen (ui/heroes.js). */
import {rpBattleStep} from '../battle/flow.js';
import {set_uiT, uiT} from '../core/app.js';
import {rpUI} from '../core/hooks.js';
import {rpGoFull} from '../core/layout.js';
import {feature, frames} from '../core/registry.js';
import {rp} from '../core/state.js';
import {$} from '../engine/util.js';
import {rpMoveFrame} from '../game/move.js';
import {rpDrawBattle} from '../render/battle.js';
import {rpDrawMap} from '../render/map.js';
import {openSelect} from '../ui/heroes.js';

function rpFrame(dt) {
  rp.t += dt;
  if (rp.mode === 'map') rpMoveFrame(dt);
  if (rp.mode === 'battle') rpBattleStep(dt);
  if (rp.mode === 'battle' && rp.bt) rpDrawBattle();
  else rpDrawMap(dt);
  set_uiT(uiT + dt);
  if (uiT > 0.15) {
    set_uiT(0);
    rpUI();
  }
  for (const f of frames) f(dt);
}
feature({
  id: 'game-play',
  init() {
    const b = typeof document !== 'undefined' && $('go-rpg');
    if (b)
      b.addEventListener('click', () => {
        rpGoFull();
        openSelect();
      });
  }
});
export {rpFrame};
