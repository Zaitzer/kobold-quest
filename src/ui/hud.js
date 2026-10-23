/* the colour-blind palette (ui-design.md §10): blue and orange for green and red */
import {hooks, rpUI} from '../core/hooks.js';
import {rpResize} from '../core/layout.js';
import {rpOpt} from '../core/options.js';
import {actions, feature, panels, routes} from '../core/registry.js';
import {rp} from '../core/state.js';
import {sfx} from '../engine/audio.js';
import {button} from '../engine/html.js';
import {$, clamp, esc2} from '../engine/util.js';
import {rpSay} from '../game/dialogue.js';
import {rpActFacing, rpTry} from '../game/move.js';
import {rpClsName, v6Stats} from '../game/sheet.js';
import {s6GoalLine} from '../game/story.js';
import {rpArea, w6RailHint} from '../game/world.js';
import {net} from '../net/core.js';
import {netMapRow} from '../net/ui.js';
import {v6PackHtml} from './screens.js';

const CB = {'#7ad67a': '#5fb0ff', '#ff6b6b': '#ff9f1c', '#ffc857': '#ffe066'};
function rpBar(v, m, col) {
  const p = clamp((v / m) * 100, 0, 100);
  if (rpOpt.cb) col = CB[col] || col;
  return '<i class="rpbar"><b style="width:' + p.toFixed(0) + '%;background:' + col + '"></b></i>';
}
function rpPartyHtml() {
  if (rp.s.w6) return v6PackHtml();
  return (
    '<div class="rpparty">' +
    rp.s.party
      .map(m => {
        const st = v6Stats(m);
        return (
          '<div class="rpm' +
          (m.hp <= 0 ? ' down' : '') +
          '"><b>' +
          esc2(m.name) +
          ' <small>' +
          rpClsName(m) +
          ' ' +
          m.lvl +
          (m.pend ? ' ★' : '') +
          '</small></b>' +
          rpBar(m.hp, st.hp, m.hp > st.hp * 0.5 ? '#7ad67a' : m.hp > st.hp * 0.25 ? '#ffc857' : '#ff6b6b') +
          '<small>HP ' +
          Math.max(0, m.hp) +
          '/' +
          st.hp +
          ' · MP ' +
          m.mp +
          '/' +
          st.mp +
          '</small></div>'
        );
      })
      .join('') +
    '</div>'
  );
}
function hudRender(force) {
  const top = $('rp-top');
  if (!top || !rp.s) return;
  const s = rp.s,
    area = rp.mode === 'battle' ? (rp.bt && rp.bt.boss ? 'Boss battle' : 'Battle') : rpArea(s.x, s.y);
  const tt = '<b>' + area + '</b><span>' + Math.floor(s.gold) + ' gold</span><span class="rpq">' + s6GoalLine() + '</span>';
  if (top.dataset.h !== tt) {
    top.dataset.h = tt;
    $('rp-topt').innerHTML = tt;
  }
  {
    const v = $('v-rpg');
    v.classList.toggle('lefty', rpOpt.hand === 'right');
    if (v.dataset && v.dataset.mode !== rp.mode) {
      v.dataset.mode = rp.mode;
      requestAnimationFrame(rpResize);
    }
  }
  /* the side sheet for this mode comes from whichever feature registered it; a panel can decline (null) and the map shows */
  const P = $('rp-panel');
  let pn = panels[rp.mode],
    h = pn && pn.html();
  if (h == null) {
    pn = panels.map;
    h = pn.html();
  }
  const sig = rp.mode + '|' + (pn.sig ? pn.sig() : '');
  /* never rebuild the panel under a thumb that is holding the joystick */
  if (rp.joyP && rp.mode === 'map' && P.querySelector && P.querySelector('[data-joy]')) return;
  if (force || sig !== rp.sig) {
    rp.sig = sig; /* keep what the player is typing (chat, a letter) when the sheet redraws */
    const ae = document.activeElement,
      keep = ae && ae.id && /^(INPUT|TEXTAREA)$/.test(ae.tagName) ? {id: ae.id, v: ae.value} : null;
    P.innerHTML = h;
    if (keep) {
      const i = document.getElementById(keep.id);
      if (i) {
        i.value = keep.v;
        i.focus();
      }
    }
  }
}
function rpMenuClick(e) {
  const b = e.target.closest && e.target.closest('button');
  if (!b || b.disabled) return;
  const d = b.dataset;
  /* buttons are routed by their data attribute: data-tac, data-net, data-g... go to that feature's handler,
     data-rp="x" goes to the action registered as x. An action returning false redraws by itself. */
  if (!rp.headless && d.rp !== 'next') sfx('tap');
  for (const k in routes)
    if (d[k] != null) {
      routes[k](d, b);
      rpUI(true);
      return;
    }
  const a = actions[d.rp];
  if (a && a(d, b) === false) return;
  rpUI(true);
}
const MAP_PANEL = {
  sig: () =>
    rp.s.party.map(m => m.hp + '/' + m.mp + '/' + m.lvl + '/' + (m.pend || 0)).join(',') +
    '|' +
    netMapRow() +
    (rp.s.w6 || '') +
    (rp.s.w6st && rp.s.w6st.cart),
  html: () =>
    netMapRow() +
    rpPartyHtml() +
    '<p class="rpkeys"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows, or click, to walk · <kbd>E</kbd> talk · <kbd>I</kbd> the pack · <kbd>M</kbd> menu</p><div class="rppad"><div class="rpjoy" data-joy="1" role="application" aria-label="Joystick: drag to walk"><i></i></div>' +
    '<div class="rpside">' +
    button('act', 'Talk / Use', {cls: 'go big', pill: 1}) +
    '<div class="rprow2">' +
    (net.on ? '<button class="pill" type="button" data-net="chat" aria-label="Chat">💬</button>' : '') +
    (rp.s.w6 === 'mine1' && rp.s.w6st && rp.s.w6st.cart !== 'done' ? button('w6hint', 'Hint', {pill: 1}) : '') +
    button('v6sheet', '⚔ Pack', {pill: 1, v: '0'}) +
    button('menu', '☰ Menu', {pill: 1}) +
    '</div><p class="rptip">Hold and drag the joystick to walk. You can also tap a spot on the map.</p></div></div>'
};
feature({
  id: 'hud',
  panels: {map: MAP_PANEL},
  routes: {dir: d => rpTry(d.dir)},
  actions: {
    act: () => rpActFacing(),
    w6hint: () => {
      rpSay([{who: '', text: w6RailHint()}]);
    }
  }
});

hooks.ui = hudRender;
export {CB, MAP_PANEL, hudRender, rpBar, rpMenuClick, rpPartyHtml};
