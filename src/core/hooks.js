/* Calls from a lower layer to a higher one (the layers are in ARCHITECTURE.md; tools/imports.js checks them). A lower module never
   imports a higher one: it calls the hook here, and the higher module fills the hook in when it loads. Each default does nothing,
   so a feature that is switched off (or not loaded, as in the logic tests) leaves the rest working. */
import {rp} from './state.js';

const hooks = {
  ui: () => {}, // redraw the side panel and the top bar (ui/hud.js)
  joyKnob: () => {}, // put the on-screen joystick's knob back (app/input.js)
  partnerName: () => 'a friend', // the friend you are playing with (net/core.js)
  fight: null, // start a fight; shared with a friend when one is free (battle/flow.js, then net/lobby.js)
  letter: () => {}, // open the letter desk (net/mail.js)
  netFx: () => {}, // show an effect on the friend's page too (net/battle.js)
  hostFrame: () => {},
  guestFrame: () => {}
}; // a shared fight's frame, as its host or its guest (net/battle.js)
function rpUI(force) {
  hooks.ui(force);
}
function partnerName() {
  return hooks.partnerName();
}
function startFight(keys, opt) {
  return hooks.fight(keys, opt);
}
function openLetter() {
  hooks.letter();
}
function shareFx(o) {
  hooks.netFx(o);
}
/* drop whatever the thumbs and keys were holding (a screen changed under them) */
function rpInputReset() {
  rp.joy = null;
  rp.joyP = null;
  rp.held = null;
  rp.keys.clear();
  if (rp.stick) rp.stick = null;
  hooks.joyKnob(0, 0);
}
export {hooks, openLetter, partnerName, rpInputReset, rpUI, shareFx, startFight};
