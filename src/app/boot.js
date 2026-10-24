/* Boot: the title screen, the sound toggle and the one frame loop. */
import {rpFrame} from './play.js';
import {view} from '../core/app.js';
import {inits} from '../core/registry.js';
import {installHooks} from '../dev/hooks.js';
import {audio, set_soundOn, sfx, soundOn} from '../engine/audio.js';
import {byBase, drawSheet} from '../engine/sheets.js';
import {$} from '../engine/util.js';

/* the title's scene (story-hatching.md): Hearthspire at dusk, the tower fire at the top, the dragon egg on its nest, Pip and two
   friends beside it, each sending its ember to the egg. The kobolds use their sheets once they have loaded (a simple shape until then). */
const TITLE_W = 360,
  TITLE_H = 170,
  GROUND = 152,
  EGG = [180, 128];
const TITLE_KS = [
  {sheet: 'pip', colour: 'orange', x: 92, face: 1, tint: '#f08a2a'},
  {sheet: 'glint', x: 262, face: -1, tint: '#e8c13a'},
  {sheet: 'wizzle', x: 312, face: -1, tint: '#d0503a'}
];
const title = {t: 0, ks: TITLE_KS.map((o, i) => Object.assign({t: i * 0.37}, o)), embers: []};
const TOWN = [
  [8, 112, 40],
  [44, 98, 30],
  [70, 118, 26],
  [100, 104, 34],
  [214, 108, 30],
  [240, 96, 38],
  [274, 116, 28],
  [300, 100, 34],
  [330, 112, 30]
];
function drawTitle(dt) {
  const c = $('title-cv');
  if (!c || !c.getContext) return;
  const g = c.getContext('2d'),
    T = (title.t += dt);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, TITLE_W, TITLE_H);
  /* the town and the tower, in silhouette */
  g.fillStyle = '#24135e';
  for (const [x, y, w] of TOWN) {
    g.fillRect(x, y, w, GROUND - y);
    g.beginPath();
    g.moveTo(x - 3, y);
    g.lineTo(x + w / 2, y - w * 0.45);
    g.lineTo(x + w + 3, y);
    g.fill();
  }
  g.fillRect(166, 34, 28, GROUND - 34);
  g.fillRect(160, 28, 40, 8);
  /* the tower fire */
  const fl = 1 + 0.12 * Math.sin(T * 9) + 0.08 * Math.sin(T * 23);
  const glow = g.createRadialGradient(180, 22, 2, 180, 22, 34 * fl);
  glow.addColorStop(0, 'rgba(255,200,80,.85)');
  glow.addColorStop(1, 'rgba(255,120,40,0)');
  g.fillStyle = glow;
  g.fillRect(140, -14, 80, 72);
  g.fillStyle = '#ffb347';
  g.beginPath();
  g.ellipse(180, 20, 7 * fl, 11 * fl, 0, 0, 7);
  g.fill();
  g.fillStyle = '#fff1b0';
  g.beginPath();
  g.ellipse(180, 23, 3.5, 6 * fl, 0, 0, 7);
  g.fill();
  /* the ground */
  g.fillStyle = '#140a35';
  g.fillRect(0, GROUND, TITLE_W, TITLE_H - GROUND);
  /* the egg on its nest, warming as the embers arrive */
  const [ex, ey] = EGG,
    warm = 0.5 + 0.5 * Math.sin(T * 2);
  const eg = g.createRadialGradient(ex, ey, 4, ex, ey, 46);
  eg.addColorStop(0, 'rgba(255,170,60,' + (0.35 + 0.25 * warm) + ')');
  eg.addColorStop(1, 'rgba(255,120,40,0)');
  g.fillStyle = eg;
  g.fillRect(ex - 50, ey - 50, 100, 100);
  g.fillStyle = '#fff4d8';
  g.strokeStyle = '#140a35';
  g.lineWidth = 3;
  g.beginPath();
  g.ellipse(ex, ey, 15, 20, 0, 0, 7);
  g.fill();
  g.stroke();
  g.fillStyle = '#f0a050';
  for (const [dx, dy, r] of [
    [-6, -6, 3],
    [5, 2, 2.5],
    [-3, 9, 2],
    [7, -11, 1.8]
  ]) {
    g.beginPath();
    g.arc(ex + dx, ey + dy, r, 0, 7);
    g.fill();
  }
  g.fillStyle = '#7a4a2a';
  g.beginPath();
  g.ellipse(ex, GROUND - 4, 30, 9, 0, 0, 7);
  g.fill();
  g.stroke();
  /* the kobolds */
  for (const k of title.ks) {
    k.t += dt;
    const key = byBase(k.sheet);
    g.save();
    g.translate(k.x, GROUND);
    g.scale(k.face, 1);
    if (!(key && drawSheet(g, key, k, {colour: k.colour}))) {
      g.fillStyle = k.tint;
      g.beginPath();
      g.ellipse(0, -26, 13, 26, 0, 0, 7);
      g.fill();
      g.beginPath();
      g.arc(4, -56, 11, 0, 7);
      g.fill();
    }
    g.restore();
  }
  /* embers: each kobold sends one up and over to the egg */
  if (Math.random() < dt * 2.4) {
    const k = title.ks[(Math.random() * title.ks.length) | 0];
    title.embers.push({x0: k.x, y0: GROUND - 50, t: 0});
  }
  title.embers = title.embers.filter(e => (e.t += dt * 0.7) < 1);
  for (const e of title.embers) {
    const u = e.t,
      x = e.x0 + (ex - e.x0) * u,
      y = e.y0 + (ey - e.y0) * u - Math.sin(u * Math.PI) * 40;
    g.fillStyle = 'rgba(255,' + (150 + 80 * u) + ',60,' + (1 - u * 0.6) + ')';
    g.beginPath();
    g.arc(x, y, 3 - u, 0, 7);
    g.fill();
  }
}
function soundButton() {
  const b = $('sound');
  if (!b) return;
  const sync = () => {
    b.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    b.textContent = soundOn ? 'Sound on' : 'Sound off';
  };
  sync();
  b.addEventListener('click', () => {
    set_soundOn(!soundOn);
    sync();
    if (soundOn) {
      audio();
      sfx('drop');
    }
  });
}
let last = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0);
  last = ts;
  if (view === 'rpg') {
    try {
      rpFrame(dt);
    } catch (err) {
      console.error('Kobold Quest frame error', err);
    }
  } else if (view === 'title') drawTitle(dt);
  requestAnimationFrame(frame);
}
export function boot() {
  if (typeof TEST !== 'undefined' && TEST) installHooks();
  for (const fn of inits) fn();
  soundButton();
  requestAnimationFrame(frame);
}
export {EGG, GROUND, TITLE_H, TITLE_KS, TITLE_W, TOWN, drawTitle, frame, last, soundButton, title};
