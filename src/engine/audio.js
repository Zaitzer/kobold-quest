/* Sound effects made in code (audio-plan.md): one AudioContext, short synth tones and noises by name (sfx('tap')), the ambient
   loops' pieces (fire crackle, mill wheel) and ducking the music under a jingle. */
import {R} from './util.js';

let soundOn = false,
  quiet = false;
let ac = null;
let duckT = 0; /* until this audio time, music plays quietly (a jingle is on) */
const lastSfx = {};
function audio() {
  if (!ac) {
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  return ac;
}
function tone(f1, f2, dur, type, vol, delay) {
  const a = audio();
  if (!a) return;
  if (a.state === 'suspended') a.resume();
  const t0 = a.currentTime + (delay || 0),
    o = a.createOscillator(),
    g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f1, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.03);
}
/* a short tune: [freq, length in beats] pairs; music ducks under it */
function jingle(notes, beat, type, vol) {
  const a = audio();
  if (!a) return;
  let t = 0;
  for (const [f, l] of notes) {
    if (f) tone(f, f * 1.003, l * beat * 1.1, type, vol, t);
    t += l * beat;
  }
  duckT = a.currentTime + t + 0.3;
}
const JINGLES = {
  spark: [
    [523, 1],
    [659, 1],
    [784, 1],
    [1047, 2],
    [988, 1],
    [1047, 1],
    [1319, 4]
  ],
  level: [
    [392, 1],
    [523, 1],
    [659, 1],
    [784, 3]
  ],
  recruit: [
    [659, 1],
    [784, 1],
    [659, 1],
    [988, 3]
  ],
  item: [
    [784, 1],
    [988, 1],
    [1175, 3]
  ],
  /* Mallow's rhyme, first two bars, thin (the bakery, her song) */
  rhyme: [
    [587, 1],
    [740, 1],
    [880, 1],
    [880, 1],
    [988, 1],
    [880, 1],
    [740, 2]
  ],
  lose: [
    [392, 2],
    [370, 2],
    [349, 2],
    [262, 6]
  ]
};
function sfx(k, p) {
  if (!soundOn || quiet) return;
  const n = performance.now();
  if (lastSfx[k] && n - lastSfx[k] < 60) return;
  lastSfx[k] = n;
  if (k === 'hit') tone(R(230, 320), 110, 0.12, 'square', 0.04);
  else if (k === 'crit') {
    tone(540, 150, 0.2, 'sawtooth', 0.05);
    tone(300, 90, 0.16, 'square', 0.04, 0.03);
  } else if (k === 'miss') tone(760, 520, 0.09, 'sine', 0.03);
  else if (k === 'ko') tone(420, 55, 0.45, 'triangle', 0.08);
  else if (k === 'nom') {
    tone(600, 900, 0.07, 'sine', 0.05);
    tone(700, 1100, 0.08, 'sine', 0.05, 0.09);
  } else if (k === 'drop') tone(300, 720, 0.13, 'sine', 0.06);
  else if (k === 'pet') tone(880, 1320, 0.1, 'sine', 0.04);
  else if (k === 'pop') tone(R(380, 520), 150, 0.09, 'square', 0.04);
  else if (k === 'blip') tone(520 * (p || 1), 500 * (p || 1), 0.035, 'square', 0.018);
  else if (k === 'tap') tone(1250, 1150, 0.025, 'sine', 0.018);
  else if (k === 'bump') tone(120, 70, 0.09, 'square', 0.045);
  else if (k === 'door') {
    tone(190, 95, 0.08, 'triangle', 0.07);
    tone(150, 70, 0.1, 'triangle', 0.06, 0.08);
  } else if (k === 'chest') {
    tone(180, 260, 0.14, 'square', 0.025);
    [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, 0.12, 'sine', 0.05, 0.14 + i * 0.06));
  } else if (k === 'fountain') {
    for (let i = 0; i < 5; i++) {
      const f = R(500, 900);
      tone(f, f * 1.8, 0.08, 'sine', 0.04, i * 0.07);
    }
  } else if (JINGLES[k]) jingle(JINGLES[k], k === 'lose' ? 0.13 : 0.09, k === 'lose' ? 'triangle' : 'square', k === 'lose' ? 0.06 : 0.045);
  /* v6 (audio-plan.md "Sounds") */ else if (k === 'crack') {
    noiseHit(2600, 0.07, 0.12);
    noiseHit(1400, 0.1, 0.09, 0.09);
    tone(220, 90, 0.18, 'square', 0.04, 0.05);
  } else if (k === 'roar') {
    tone(160, 70, 0.7, 'sawtooth', 0.07);
    tone(110, 55, 0.8, 'square', 0.05, 0.05);
    noiseHit(500, 0.6, 0.07);
  } else if (k === 'mine') tone(150 * (p || 1), 120 * (p || 1), 0.12, 'square', 0.035);
  else if (k === 'ember') {
    [392, 494, 587, 784, 988].forEach((f, i) => tone(f, f * 1.01, 0.5, 'sine', 0.035, i * 0.12));
    duckT = (audio() || {currentTime: 0}).currentTime + 1.2;
  } else if (k === 'clack') {
    noiseHit(3200, 0.03, 0.18);
    tone(900, 600, 0.03, 'square', 0.03);
  } else if (k === 'skree') {
    tone(1800, 2600, 0.09, 'sawtooth', 0.03);
    tone(2400, 1500, 0.14, 'square', 0.025, 0.08);
  } else if (k === 'win') {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, 0.16, 'triangle', 0.06, i * 0.11));
  }
}
/* a kobold yip: two quick rising chirps. vol 0..1, pan -1 (left) .. 1 (right), pitch around 1 (each player has their own) */
function yip(vol, pan, pitch) {
  if (!soundOn || quiet || !(vol > 0.01)) return;
  const a = audio();
  if (!a) return;
  if (a.state === 'suspended') a.resume();
  const t0 = a.currentTime,
    p = pitch || 1,
    out = a.createGain();
  out.gain.value = Math.min(1, vol);
  if (a.createStereoPanner) {
    const sp = a.createStereoPanner();
    sp.pan.value = Math.max(-1, Math.min(1, pan || 0));
    out.connect(sp);
    sp.connect(a.destination);
  } else out.connect(a.destination);
  const chirp = (f1, f2, d, type, v, dl) => {
    const o = a.createOscillator(),
      g = a.createGain(),
      t = t0 + dl;
    o.type = type;
    o.frequency.setValueAtTime(f1 * p, t);
    o.frequency.exponentialRampToValueAtTime(f2 * p, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t + d);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + d + 0.03);
  };
  chirp(620, 1450, 0.075, 'square', 0.09, 0);
  chirp(900, 1900, 0.06, 'triangle', 0.08, 0.085);
  chirp(1000, 1500, 0.05, 'sine', 0.05, 0.085);
}
/* a short filtered noise burst (cracks, clacks, splashes) */
let noiseBuf = null;
function noise(a) {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate * 0.8, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}
function noiseAt(a, dest, f, dur, vol, t, type) {
  const s = a.createBufferSource(),
    fl = a.createBiquadFilter(),
    g = a.createGain();
  s.buffer = noise(a);
  fl.type = type || 'bandpass';
  fl.frequency.value = f;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(fl);
  fl.connect(g);
  g.connect(dest);
  s.start(t);
  s.stop(t + dur + 0.02);
}
function noiseHit(f, dur, vol, delay) {
  const a = audio();
  if (!a) return;
  noiseAt(a, a.destination, f, dur, vol, a.currentTime + (delay || 0));
}
/* the ambient loops (engine/music.js schedules them on the music bus) */
function fxCrackle(a, dest, t) {
  noiseAt(a, dest, 1500 + Math.random() * 2500, 0.02 + Math.random() * 0.04, 0.25 + Math.random() * 0.35, t, 'highpass');
  if (Math.random() < 0.3) noiseAt(a, dest, 300, 0.15, 0.18, t + 0.03, 'lowpass');
}
function fxWheel(a, dest, t) {
  const o = a.createOscillator(),
    g = a.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(70, t);
  o.frequency.linearRampToValueAtTime(95, t + 0.35);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.1);
  g.gain.linearRampToValueAtTime(0, t + 0.4);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + 0.45);
  noiseAt(a, dest, 900, 0.5, 0.22, t + 0.5, 'lowpass');
  noiseAt(a, dest, 1400, 0.3, 0.12, t + 0.9, 'bandpass');
}
function set_soundOn(v) {
  return (soundOn = v);
}
export {
  JINGLES,
  ac,
  audio,
  duckT,
  fxCrackle,
  fxWheel,
  jingle,
  lastSfx,
  noise,
  noiseAt,
  noiseBuf,
  noiseHit,
  quiet,
  set_soundOn,
  sfx,
  soundOn,
  tone,
  yip
};
