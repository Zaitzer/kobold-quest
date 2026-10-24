/* Keyboard and touch on the map: the thumbstick, the on-screen joystick, arrow keys and WASD, taps on the panel's buttons (routed by
   ui/hud.js) and taps on the map (walk there, or talk). */
import {view} from '../core/app.js';
import {hooks, rpInputReset, rpUI} from '../core/hooks.js';
import {RPH, RPW, RT, rpLayout, rpLoc, rpResize, rpVec, rpcv} from '../core/layout.js';
import {feature} from '../core/registry.js';
import {controls, rp, walker} from '../core/state.js';
import {$} from '../engine/util.js';
import {rpChoose, rpDlgNext} from '../game/dialogue.js';
import {rpTapTile} from '../game/move.js';
import {netSay} from '../net/chat.js';
import {rpTacClick} from '../ui/battle.js';
import {rpMenuClick} from '../ui/hud.js';

function rpStickEnd(e) {
  const S = controls.stick;
  if (!S || (e && S.id !== e.pointerId)) return;
  if (S.on) {
    controls.held = null;
    controls.stickUsed = true;
    setTimeout(() => {
      controls.stickUsed = false;
    }, 0);
  }
  controls.stick = null;
}
const RP_KEYS = {arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right'};
function rpJoyKnob(dx, dy) {
  const j = document.querySelector ? document.querySelector('#rp-panel [data-joy]') : null;
  if (!j || !j.style) return;
  j.style.setProperty('--jx', dx + 'px');
  j.style.setProperty('--jy', dy + 'px');
  j.classList.toggle('on', !!(dx || dy));
}
function rpJoyMove(e) {
  const P = controls.joyP;
  if (!P) return;
  const v = rpVec(e.clientX - P.cx, e.clientY - P.cy);
  let dx = v.x,
    dy = v.y;
  const d = Math.hypot(dx, dy);
  if (d > P.R) {
    dx *= P.R / d;
    dy *= P.R / d;
  }
  controls.joy = {x: dx / P.R, y: dy / P.R};
  rpJoyKnob(dx, dy);
}
function rpJoyEnd(e) {
  const P = controls.joyP;
  if (!P || (e && e.pointerId !== P.id)) return;
  controls.joyP = null;
  controls.joy = null;
  rpJoyKnob(0, 0);
}
/* never keep walking once no finger is on the screen */
feature({
  id: 'core-input',
  init() {
    controls.stick = null;
    rpcv.addEventListener('pointerdown', e => {
      if (rp.mode !== 'map') return;
      {
        const L = rpLoc(e, rpcv);
        controls.stick = {id: e.pointerId, x: e.clientX, y: e.clientY, lx: L.x / L.w, ly: L.y / L.h, dx: 0, dy: 0, on: false};
      }
      try {
        rpcv.setPointerCapture(e.pointerId);
      } catch (_) {}
    });
    rpcv.addEventListener('pointermove', e => {
      const S = controls.stick;
      if (!S || S.id !== e.pointerId) return;
      {
        const v = rpVec(e.clientX - S.x, e.clientY - S.y);
        S.dx = v.x;
        S.dy = v.y;
      }
      if (!S.on && Math.hypot(S.dx, S.dy) > 14) {
        S.on = true;
        walker.path = null;
      }
      if (S.on) e.preventDefault();
    });
    rpcv.addEventListener('pointerup', rpStickEnd);
    rpcv.addEventListener('pointercancel', rpStickEnd);
    rpcv.addEventListener('click', e => {
      if (controls.stickUsed) return;
      if (rp.mode === 'battle') {
        if (rp.bt) rpTacClick(e);
        return;
      }
      if (rp.mode === 'dialog') {
        rpDlgNext();
        return;
      }
      if (rp.mode !== 'map') return;
      const L = rpLoc(e, rpcv),
        x = (L.x / L.w) * RPW + walker.cam.x,
        y = (L.y / L.h) * RPH + walker.cam.y;
      rpTapTile(Math.floor(x / RT), Math.floor(y / RT));
    });
    $('rp-panel').addEventListener('click', rpMenuClick);
    $('rp-panel').addEventListener('pointerdown', e => {
      const b = e.target.closest && e.target.closest('button[data-dir]');
      if (b) {
        controls.held = b.dataset.dir;
        walker.path = null;
        e.preventDefault();
      }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t =>
      $('rp-panel').addEventListener(t, () => {
        controls.held = null;
      })
    );
    document.addEventListener('keydown', e => {
      if (view !== 'rpg') return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        if (e.key === 'Enter' && e.target.id === 'kq-chat') {
          netSay(e.target.value);
          e.target.value = '';
          e.preventDefault();
        }
        return;
      }
      const k = e.key.toLowerCase();
      if (RP_KEYS[k] && rp.mode === 'map') {
        controls.keys.add(RP_KEYS[k]);
        walker.path = null;
        e.preventDefault();
        return;
      }
      if (k === 'm') {
        if (rp.mode === 'map') {
          rp.mode = 'menu';
          rp.menuSel = null;
          rpUI(true);
        } else if (rp.mode === 'menu') {
          rp.mode = 'map';
          rpUI(true);
        }
        return;
      }
      if (k === 'escape') {
        if (rp.mode === 'menu') {
          rp.mode = 'map';
          rpUI(true);
        } else if (rp.mode !== 'map' && rp.mode !== 'battle' && rp.mode !== 'dialog') {
          rp.mode = 'map';
          rpUI(true);
        }
        return;
      }
      if (rp.mode === 'dialog' && /^[1-9]$/.test(k) && rp.dlg && rp.dlg.choices && rp.dlg.i >= rp.dlg.lines.length - 1) {
        rpChoose(+k - 1);
        return;
      }
      if (k === 'h' || k === 'i') {
        if (rp.mode === 'map') {
          rp.mode = 'v6sheet';
          rpUI(true);
        } else if (rp.mode === 'v6sheet') {
          rp.mode = 'map';
          rpUI(true);
        }
        return;
      }
      if (k === 'enter' || k === ' ' || k === 'e') {
        if (rp.mode === 'dialog' && (!rp.dlg.choices || rp.dlg.i < rp.dlg.lines.length - 1)) rpDlgNext();
        else if (rp.mode === 'map') rpMenuClick({target: {closest: () => ({disabled: false, dataset: {rp: 'act'}})}});
        e.preventDefault();
      }
    });
    document.addEventListener('keyup', e => {
      const k = e.key.toLowerCase();
      if (RP_KEYS[k]) controls.keys.delete(RP_KEYS[k]);
    });
    window.addEventListener('blur', () => {
      controls.keys.clear();
      controls.held = null;
    });
    window.addEventListener('resize', () => {
      if (view === 'rpg') {
        rpLayout();
        rpResize();
      }
    });
    controls.joy = null;
    controls.joyP = null;
    $('rp-panel').addEventListener('pointerdown', e => {
      const j = e.target.closest && e.target.closest('[data-joy]');
      if (!j) return;
      const r = j.getBoundingClientRect();
      controls.joyP = {id: e.pointerId, cx: r.left + r.width / 2, cy: r.top + r.height / 2, R: r.width * 0.36};
      rpJoyMove(e);
      e.preventDefault();
      try {
        j.setPointerCapture(e.pointerId);
      } catch (_) {}
    });
    window.addEventListener(
      'pointermove',
      e => {
        if (controls.joyP && e.pointerId === controls.joyP.id) {
          rpJoyMove(e);
          e.preventDefault();
        }
      },
      {passive: false}
    );
    window.addEventListener('pointerup', rpJoyEnd);
    window.addEventListener('pointercancel', rpJoyEnd);
    ['touchend', 'touchcancel'].forEach(t =>
      window.addEventListener(t, e => {
        if (!e.touches || e.touches.length === 0) rpInputReset();
      })
    );
    window.addEventListener('blur', rpInputReset);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) rpInputReset();
    });
  }
});

hooks.joyKnob = rpJoyKnob;
export {RP_KEYS, rpJoyEnd, rpJoyKnob, rpJoyMove, rpStickEnd};
