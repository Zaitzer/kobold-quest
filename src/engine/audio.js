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
/* a kobold yip: two quick rising chirps. vol 0..1, pan -1 (left) .. 1 (right), pitch around 1 (each player has their own) */
function yip(vol,pan,pitch){if(!soundOn||quiet||!(vol>.01))return;const a=audio();if(!a)return;if(a.state==='suspended')a.resume();
  const t0=a.currentTime,p=pitch||1,out=a.createGain();out.gain.value=Math.min(1,vol);
  if(a.createStereoPanner){const sp=a.createStereoPanner();sp.pan.value=Math.max(-1,Math.min(1,pan||0));out.connect(sp);sp.connect(a.destination)}else out.connect(a.destination);
  const chirp=(f1,f2,d,type,v,dl)=>{const o=a.createOscillator(),g=a.createGain(),t=t0+dl;o.type=type;o.frequency.setValueAtTime(f1*p,t);o.frequency.exponentialRampToValueAtTime(f2*p,t+d);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(out);o.start(t);o.stop(t+d+.03)};
  chirp(620,1450,.075,'square',.09,0);chirp(900,1900,.06,'triangle',.08,.085);chirp(1000,1500,.05,'sine',.05,.085)}
/* phones start audio suspended until a tap: resume it and play one silent sample inside the tap */
function unlockAudio(){const a=audio();if(!a)return;try{if(a.state==='suspended')a.resume();const b=a.createBuffer(1,1,22050),src=a.createBufferSource();src.buffer=b;src.connect(a.destination);src.start(0)}catch(e){}}
function audioReady(){return !!ac&&ac.state==='running'}
function set_soundOn(v){return soundOn=v}
export {ac,audio,audioReady,lastSfx,quiet,set_soundOn,sfx,soundOn,tone,unlockAudio,yip};
