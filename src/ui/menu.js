/* The ☰ menu (its screen is v6MenuHtml in ui/screens.js), the settings anything can add (feature options:[...]), quitting. */
import {show} from '../core/app.js';
import {rpExitFull, rpGoFull} from '../core/layout.js';
import {rpBuzz, rpOpt, rpOptSave} from '../core/options.js';
import {feature, options} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {audio, set_soundOn, sfx, soundOn} from '../engine/audio.js';
import {$} from '../engine/util.js';
import {netLeaveRpg} from '../net/core.js';
import {V6S, v6MenuHtml} from './screens.js';

function soundLabel() {
  const sb = $('sound');
  if (sb) {
    sb.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    sb.textContent = soundOn ? 'Sound on' : 'Sound off';
  }
}
feature({
  id: 'menu',
  panels: {
    menu: {
      sig: () =>
        JSON.stringify([V6S.item, rp.s.gold, rp.s.q, rp.s.bag]) + rp.s.party.map(m => m.hp + '/' + m.mp + '/' + (m.pend || 0)).join(),
      html: v6MenuHtml
    }
  },
  routes: {
    opt: d => {
      const o = options.find(o => o.id === d.opt);
      if (o) o.toggle();
    }
  },
  actions: {
    menu: () => {
      rp.mode = 'menu';
      V6S.item = null;
    },
    close: () => {
      rp.mode = 'map';
    },
    quit: () => {
      rpSave();
      netLeaveRpg();
      rpExitFull();
      show('title');
      return false;
    }
  },
  options: [
    {
      id: 'hand',
      order: 10,
      label: () => 'Joystick on the ' + (rpOpt.hand === 'left' ? 'left' : 'right'),
      hint: 'Tap to swap sides',
      toggle() {
        rpOpt.hand = rpOpt.hand === 'left' ? 'right' : 'left';
        rpOptSave();
      }
    },
    {
      id: 'buzz',
      order: 20,
      label: () => 'Vibration ' + (rpOpt.buzz ? 'on' : 'off'),
      hint: 'Shakes on fights and level-ups',
      toggle() {
        rpOpt.buzz = !rpOpt.buzz;
        rpOptSave();
        if (rpOpt.buzz) rpBuzz(30);
      }
    },
    {
      id: 'snd',
      order: 30,
      label: () => 'Sound ' + (soundOn ? 'on' : 'off'),
      hint: 'Sound effects and music',
      toggle() {
        set_soundOn(!soundOn);
        soundLabel();
        if (soundOn) {
          audio();
          sfx('drop');
        }
      }
    },
    {
      id: 'music',
      order: 40,
      label: () => 'Music ' + (rpOpt.music === false ? 'off' : 'on'),
      hint: 'A tune for every area',
      toggle() {
        rpOpt.music = rpOpt.music === false;
        rpOptSave();
      }
    },
    {
      id: 'full',
      order: 60,
      label: () => 'Fullscreen',
      hint: 'Hide the browser bars',
      toggle() {
        if (document.fullscreenElement) rpExitFull();
        else rpGoFull(true);
      }
    },
    {
      id: 'bspd',
      order: 70,
      label: () => 'Enemy turns ' + (rpOpt.bspd || 1) + '×',
      hint: 'How fast enemies move in battle',
      toggle() {
        rpOpt.bspd = (rpOpt.bspd || 1) >= 4 ? 1 : (rpOpt.bspd || 1) * 2;
        rpOptSave();
      }
    }
  ]
});
export {soundLabel};
