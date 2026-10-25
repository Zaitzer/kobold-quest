/* ---------- Kobold Quest: free, smooth movement on the world map ----------
   Pip has a real position (in tiles, fractional). The thumbstick is analog, the
   keyboard does 8 directions, walls slide, and pushing into someone talks to them. */
import {emit} from '../core/bus.js';
import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {controls, rp, walker} from '../core/state.js';
import {dirOf} from '../engine/sheets.js';
import {clamp} from '../engine/util.js';
import {s6Bump, s6NpcAt} from './story.js';
import {rpBfs, rpSolid, w6Bump, w6LinkAt, w6Step, w6Use} from './world.js';

const RP_SPEED = 4.6,
  RP_R = 0.28;
const RP_DIR = {up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]};
function rpSyncPos() {
  const s = rp.s;
  /* never start inside something solid (a new building, a stall): step to the nearest free tile */
  if (rpSolid(s.x, s.y)) {
    let best = null,
      bd = 1e9;
    for (let y = Math.max(1, s.y - 4); y <= Math.min(rp.grid.length - 2, s.y + 4); y++)
      for (let x = Math.max(1, s.x - 4); x <= Math.min(rp.grid[0].length - 2, s.x + 4); x++) {
        if (rpSolid(x, y)) continue;
        const d = Math.abs(x - s.x) + Math.abs(y - s.y);
        if (d < bd) {
          bd = d;
          best = [x, y];
        }
      }
    if (best) {
      s.x = best[0];
      s.y = best[1];
    }
  }
  walker.pos = {x: s.x + 0.5, y: s.y + 0.5};
  rp.pt = [s.x, s.y];
}
/* is the point inside something you can't walk through */
function rpBlockedAt(x, y) {
  for (const [ox, oy] of [
    [-RP_R, -RP_R * 0.6],
    [RP_R, -RP_R * 0.6],
    [-RP_R, RP_R],
    [RP_R, RP_R]
  ]) {
    const tx = Math.floor(x + ox),
      ty = Math.floor(y + oy);
    if (rpSolid(tx, ty)) return [tx, ty];
  }
  return null;
}
/* things you can interact with on a tile */
function rpInteractAt(x, y) {
  if (!rp.grid[y]) return false;
  if (s6Bump(x, y) || w6Bump(x, y) || w6Use(x, y)) {
    walker.path = null;
    return true;
  }
  return false;
}
function rpSpecialAt(x, y) {
  const c = rp.grid[y] && rp.grid[y][x];
  return !!(c && 'FocxpHSC'.includes(c)) || !!w6LinkAt(rp.s.w6, x, y, 'bump') || !!s6NpcAt(x, y, true);
}
/* Pip steps onto a new tile */
function rpEnterTile(tx, ty) {
  const s = rp.s;
  s.x = tx;
  s.y = ty;
  rp.pt = [tx, ty];
  s.steps++;
  const c = rp.grid[ty][tx];
  emit('tile:enter', tx, ty, c);
  const g = walker.grace > 0;
  if (w6Step(tx, ty, c)) {
    if (s.steps % 10 === 0) rpSave();
    return;
  }
  if (g) walker.grace--;
  if (s.steps % 10 === 0) rpSave();
}
/* the direction Pip wants to go this frame (length 0..1) */
function rpWant() {
  const s = rp.s;
  if (controls.joy && !controls.joyP) controls.joy = null;
  if (controls.joy) {
    const m = Math.hypot(controls.joy.x, controls.joy.y);
    if (m > 0.18) {
      walker.path = null;
      const k = clamp((m - 0.18) / 0.62, 0.35, 1);
      return {x: (controls.joy.x / m) * k, y: (controls.joy.y / m) * k};
    }
  }
  if (controls.stick && controls.stick.on) {
    const d = Math.hypot(controls.stick.dx, controls.stick.dy);
    if (d > 0) {
      const m = clamp((d - 8) / 40, 0.35, 1);
      return {x: (controls.stick.dx / d) * m, y: (controls.stick.dy / d) * m};
    }
  }
  let x = 0,
    y = 0;
  const add = dir => {
    const v = RP_DIR[dir];
    x += v[0];
    y += v[1];
  };
  controls.keys.forEach(add);
  if (controls.held && !controls.keys.has(controls.held)) add(controls.held);
  if (x || y) {
    const d = Math.hypot(x, y);
    return {x: x / d, y: y / d};
  }
  if (walker.path) {
    if (!walker.path.length) {
      walker.path = null;
      if (walker.pathEnd) {
        const [tx, ty] = walker.pathEnd;
        walker.pathEnd = null;
        s.face = tx > s.x ? 'right' : tx < s.x ? 'left' : ty > s.y ? 'down' : 'up';
        walker.dir8 = s.face;
        rpInteractAt(tx, ty);
      }
      return {x: 0, y: 0};
    }
    const [nx, ny] = walker.path[0],
      dx = nx + 0.5 - walker.pos.x,
      dy = ny + 0.5 - walker.pos.y,
      d = Math.hypot(dx, dy);
    if (d < 0.14) {
      walker.path.shift();
      return rpWant();
    }
    return {x: dx / d, y: dy / d, path: 1};
  }
  return {x: 0, y: 0};
}
function rpMoveFrame(dt) {
  const s = rp.s;
  if (!walker.pos) rpSyncPos();
  if (rp.pt[0] !== s.x || rp.pt[1] !== s.y) rpSyncPos();
  const w = rpWant();
  walker.moving = false;
  if (!w.x && !w.y) {
    controls.bumpT = 0;
    controls.bumpLock = null;
    return;
  }
  if (Math.abs(w.x) > Math.abs(w.y) * 1.05) s.face = w.x > 0 ? 'right' : 'left';
  else if (Math.abs(w.y) > 0.01) s.face = w.y > 0 ? 'down' : 'up';
  walker.dir8 = dirOf(w.x, w.y); // the way the kobold looks: 8 ways (its sheet's rows)
  const step = RP_SPEED * dt,
    p = walker.pos;
  let moved = false,
    hit = null;
  /* move in small slices so fast frames never skip a wall */
  const n = Math.max(1, Math.ceil(step / 0.2));
  for (let i = 0; i < n; i++) {
    const sx = (w.x * step) / n,
      sy = (w.y * step) / n;
    if (sx) {
      const b = rpBlockedAt(p.x + sx, p.y);
      if (!b) {
        p.x += sx;
        moved = true;
      } else {
        hit = b;
        /* slide round corners: nudge toward the middle of the row */
        if (Math.abs(w.y) < 0.3) {
          const cy = Math.floor(p.y) + 0.5,
            dy = cy - p.y;
          if (Math.abs(dy) > 0.02 && !rpBlockedAt(p.x, p.y + Math.sign(dy) * Math.min(Math.abs(dy), step / n))) {
            p.y += Math.sign(dy) * Math.min(Math.abs(dy), step / n);
            moved = true;
          }
        }
      }
    }
    if (sy) {
      const b = rpBlockedAt(p.x, p.y + sy);
      if (!b) {
        p.y += sy;
        moved = true;
      } else {
        hit = b;
        if (Math.abs(w.x) < 0.3) {
          const cx = Math.floor(p.x) + 0.5,
            dx = cx - p.x;
          if (Math.abs(dx) > 0.02 && !rpBlockedAt(p.x + Math.sign(dx) * Math.min(Math.abs(dx), step / n), p.y)) {
            p.x += Math.sign(dx) * Math.min(Math.abs(dx), step / n);
            moved = true;
          }
        }
      }
    }
  }
  walker.moving = moved;
  const tx = Math.floor(p.x),
    ty = Math.floor(p.y);
  if (tx !== s.x || ty !== s.y) {
    rpEnterTile(tx, ty);
    if (rp.mode !== 'map') return;
  }
  /* pushing into someone (or a door, chest, shrine…) for a moment uses it */
  if (hit && !w.path) {
    const fx = s.x + RP_DIR[s.face][0],
      fy = s.y + RP_DIR[s.face][1];
    if (rpSpecialAt(fx, fy)) {
      const key = fx + ',' + fy;
      if (controls.bumpLock !== key) {
        controls.bumpT += dt;
        if (controls.bumpT > 0.12) {
          controls.bumpT = 0;
          controls.bumpLock = key;
          controls.held = null;
          rpInteractAt(fx, fy);
        }
      }
    } else controls.bumpT = 0;
  } else if (!hit) {
    controls.bumpT = 0;
    controls.bumpLock = null;
  }
  if (walker.path && !moved && hit) {
    walker.path = null;
  }
}
/* one-tile nudge (keyboard Enter on a d-pad button, tests) */
function rpTry(dir) {
  const s = rp.s,
    [dx, dy] = RP_DIR[dir],
    nx = s.x + dx,
    ny = s.y + dy;
  s.face = dir;
  walker.dir8 = dir;
  if (rpInteractAt(nx, ny)) return false;
  if (rpSolid(nx, ny)) return false;
  walker.path = [[nx, ny]];
  walker.pathEnd = null;
  return true;
}
function rpTapTile(tx, ty) {
  if (rp.mode !== 'map') return;
  const c = rp.grid[ty] && rp.grid[ty][tx];
  if (c == null) return;
  if (rpSpecialAt(tx, ty)) {
    const p = rpBfs(tx, ty, true);
    if (p) {
      walker.path = p;
      walker.pathEnd = [tx, ty];
    }
    return;
  }
  if (rpSolid(tx, ty)) return;
  const p = rpBfs(tx, ty, false);
  if (p && p.length) {
    walker.path = p;
    walker.pathEnd = null;
  }
}
function rpActFacing() {
  const s = rp.s,
    [dx, dy] = RP_DIR[s.face];
  if (rpInteractAt(s.x + dx, s.y + dy)) return;
  /* nothing straight ahead: try anything touching Pip */
  for (const d of ['up', 'down', 'left', 'right']) {
    const v = RP_DIR[d];
    if (rpSpecialAt(s.x + v[0], s.y + v[1])) {
      s.face = d;
      walker.dir8 = d;
      rpInteractAt(s.x + v[0], s.y + v[1]);
      return;
    }
  }
}
feature({
  id: 'game-move',
  init() {
    walker.pos = null;
    rp.pt = null;
    controls.keys = new Set();
    controls.bumpT = 0;
    controls.bumpLock = null;
    walker.moving = false;
  }
});
export {
  RP_DIR,
  RP_R,
  RP_SPEED,
  rpActFacing,
  rpBlockedAt,
  rpEnterTile,
  rpInteractAt,
  rpMoveFrame,
  rpSpecialAt,
  rpSyncPos,
  rpTapTile,
  rpTry,
  rpWant
};
