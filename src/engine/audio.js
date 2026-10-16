import {R} from './util.js';
let soundOn=false,quiet=false;
let ac=null;
const lastSfx={};
function audio(){if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}return ac}
function tone(f1,f2,dur,type,vol,delay){
  const a=audio();if(!a)return;if(a.state==='suspended')a.resume();
  const t0=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
  o.type=type;o.frequency.setValueAtTime(f1,t0);o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t0+dur);
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.001,t0+dur);
  o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+dur+.03);
}
function sfx(k){
  if(!soundOn||quiet)return;const n=performance.now();if(lastSfx[k]&&n-lastSfx[k]<60)return;lastSfx[k]=n;
  if(k==='hit')tone(R(230,320),110,.12,'square',.04);
  else if(k==='crit'){tone(540,150,.2,'sawtooth',.05);tone(300,90,.16,'square',.04,.03)}
  else if(k==='miss')tone(760,520,.09,'sine',.03);
  else if(k==='ko')tone(420,55,.45,'triangle',.08);
  else if(k==='nom'){tone(600,900,.07,'sine',.05);tone(700,1100,.08,'sine',.05,.09)}
  else if(k==='drop')tone(300,720,.13,'sine',.06);
  else if(k==='pet')tone(880,1320,.1,'sine',.04);
  else if(k==='pop')tone(R(380,520),150,.09,'square',.04);
  else if(k==='win'){[523,659,784,1047].forEach((f,i)=>tone(f,f*1.01,.16,'triangle',.06,i*.11))}
}
function set_soundOn(v){return soundOn=v}
export {ac,audio,lastSfx,quiet,set_soundOn,sfx,soundOn,tone};
