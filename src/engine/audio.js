import {R} from './util.js';
let soundOn=false,quiet=false;
let ac=null;
let duckT=0;/* until this audio time, music plays quietly (a jingle is on) */
const lastSfx={};
function audio(){if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}return ac}
function tone(f1,f2,dur,type,vol,delay){
  const a=audio();if(!a)return;if(a.state==='suspended')a.resume();
  const t0=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
  o.type=type;o.frequency.setValueAtTime(f1,t0);o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t0+dur);
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.001,t0+dur);
  o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+dur+.03);
}
/* a short tune: [freq, length in beats] pairs; music ducks under it */
function jingle(notes,beat,type,vol){const a=audio();if(!a)return;let t=0;for(const [f,l] of notes){if(f)tone(f,f*1.003,l*beat*1.1,type,vol,t);t+=l*beat}duckT=a.currentTime+t+.3}
const JINGLES={
  spark:[[523,1],[659,1],[784,1],[1047,2],[988,1],[1047,1],[1319,4]],
  level:[[392,1],[523,1],[659,1],[784,3]],
  recruit:[[659,1],[784,1],[659,1],[988,3]],
  item:[[784,1],[988,1],[1175,3]],
  lose:[[392,2],[370,2],[349,2],[262,6]]};
function sfx(k,p){
  if(!soundOn||quiet)return;const n=performance.now();if(lastSfx[k]&&n-lastSfx[k]<60)return;lastSfx[k]=n;
  if(k==='hit')tone(R(230,320),110,.12,'square',.04);
  else if(k==='crit'){tone(540,150,.2,'sawtooth',.05);tone(300,90,.16,'square',.04,.03)}
  else if(k==='miss')tone(760,520,.09,'sine',.03);
  else if(k==='ko')tone(420,55,.45,'triangle',.08);
  else if(k==='nom'){tone(600,900,.07,'sine',.05);tone(700,1100,.08,'sine',.05,.09)}
  else if(k==='drop')tone(300,720,.13,'sine',.06);
  else if(k==='pet')tone(880,1320,.1,'sine',.04);
  else if(k==='pop')tone(R(380,520),150,.09,'square',.04);
  else if(k==='blip')tone(520*(p||1),500*(p||1),.035,'square',.018);
  else if(k==='tap')tone(1250,1150,.025,'sine',.018);
  else if(k==='bump')tone(120,70,.09,'square',.045);
  else if(k==='door'){tone(190,95,.08,'triangle',.07);tone(150,70,.1,'triangle',.06,.08)}
  else if(k==='chest'){tone(180,260,.14,'square',.025);[784,988,1175,1568].forEach((f,i)=>tone(f,f,.12,'sine',.05,.14+i*.06))}
  else if(k==='fountain'){for(let i=0;i<5;i++){const f=R(500,900);tone(f,f*1.8,.08,'sine',.04,i*.07)}}
  else if(JINGLES[k])jingle(JINGLES[k],k==='lose'?.13:.09,k==='lose'?'triangle':'square',k==='lose'?.06:.045);
  else if(k==='win'){[523,659,784,1047].forEach((f,i)=>tone(f,f*1.01,.16,'triangle',.06,i*.11))}
}
/* a kobold yip: two quick rising chirps. vol 0..1, pan -1 (left) .. 1 (right), pitch around 1 (each player has their own) */
function yip(vol,pan,pitch){if(!soundOn||quiet||!(vol>.01))return;const a=audio();if(!a)return;if(a.state==='suspended')a.resume();
  const t0=a.currentTime,p=pitch||1,out=a.createGain();out.gain.value=Math.min(1,vol);
  if(a.createStereoPanner){const sp=a.createStereoPanner();sp.pan.value=Math.max(-1,Math.min(1,pan||0));out.connect(sp);sp.connect(a.destination)}else out.connect(a.destination);
  const chirp=(f1,f2,d,type,v,dl)=>{const o=a.createOscillator(),g=a.createGain(),t=t0+dl;o.type=type;o.frequency.setValueAtTime(f1*p,t);o.frequency.exponentialRampToValueAtTime(f2*p,t+d);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(out);o.start(t);o.stop(t+d+.03)};
  chirp(620,1450,.075,'square',.09,0);chirp(900,1900,.06,'triangle',.08,.085);chirp(1000,1500,.05,'sine',.05,.085)}
function set_soundOn(v){return soundOn=v}
export {JINGLES,ac,audio,duckT,jingle,lastSfx,quiet,set_soundOn,sfx,soundOn,tone,yip};
