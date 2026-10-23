/* The player's settings on this device (handedness, buzz, sound, reduced motion, colours, text size): kept in browser storage. */
import {store} from '../adapters/storage.js';
import {rpLayout} from './layout.js';
import {rp} from './state.js';
import {fxOpt} from '../engine/fx.js';
import {$} from '../engine/util.js';

const RP_OPT_KEY = 'kobold-pit-rpopt';
const rpOpt = Object.assign({hand: 'left', buzz: true}, store.get(RP_OPT_KEY, {}));
fxOpt.calm = !!rpOpt.calm;
function rpOptSave() {
  store.set(RP_OPT_KEY, rpOpt);
  fxOpt.calm = !!rpOpt.calm;
  const v = $('v-rpg');
  if (v) v.classList.toggle('lefty', rpOpt.hand === 'right');
  rpLayout();
}
function rpBuzz(p) {
  if (rp.headless || !rpOpt.buzz) return;
  try {
    navigator.vibrate && navigator.vibrate(p);
  } catch (e) {}
}
export {RP_OPT_KEY, rpBuzz, rpOpt, rpOptSave};
