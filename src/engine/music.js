/* ---------- Kobold Quest: little chiptune tracks, made up on the fly ----------
   Each area has a key, a tempo and a seed. A 4-bar chord loop carries a lead
   melody (8 bars, two phrases), a bass line and simple noise drums. */
import {view} from '../core/app.js';
import {rpOpt} from '../core/options.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {ac,audio,soundOn} from './audio.js';
import {clamp,seeded} from './util.js';
import {rpArea} from '../game/world.js';

const RP_SCALES={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],penta:[0,2,4,7,9],mpenta:[0,3,5,7,10],harm:[0,2,3,5,7,8,11],phryg:[0,1,3,5,7,8,10]};
const RP_TRACKS={
  village:{bpm:100,root:62,sc:'major',prog:[0,3,4,0],seed:3,lead:'square',vol:.5,dr:'light'},
  meadow:{bpm:124,root:64,sc:'penta',prog:[0,4,5,3],seed:7,lead:'square',vol:.55,dr:'bounce'},
  woods:{bpm:90,root:57,sc:'dorian',prog:[0,6,3,4],seed:11,lead:'triangle',vol:.6,dr:'soft'},
  cave:{bpm:72,root:52,sc:'mpenta',prog:[0,0,5,4],seed:5,lead:'triangle',vol:.6,dr:'drip'},
  hoard:{bpm:110,root:55,sc:'harm',prog:[0,5,3,4],seed:9,lead:'square',vol:.5,dr:'march'},
  battle:{bpm:146,root:57,sc:'minor',prog:[0,5,6,4],seed:13,lead:'square',vol:.5,dr:'drive'},
  boss:{bpm:158,root:52,sc:'phryg',prog:[0,1,0,6],seed:17,lead:'sawtooth',vol:.42,dr:'drive'}
};
const rpMus={on:false,key:null,g:null,next:0,step:0,song:null,noise:null};
const mtof=m=>440*Math.pow(2,(m-69)/12);
function rpSong(T){
  const r=seeded(T.seed*7919),S=RP_SCALES[T.sc],n=S.length;
  const deg=(d,oct)=>T.root+S[((d%n)+n)%n]+12*(Math.floor(d/n)+(oct||0));
  /* melody: 8 bars of 8 eighth notes; phrase B answers phrase A */
  const phrase=()=>{const out=[];let d=2+(r()*3|0);for(let bar=0;bar<4;bar++){const ch=T.prog[bar];for(let i=0;i<8;i++){
      const rest=r()<(T.dr==='drip'?.45:.22)&&i%2===1;if(rest){out.push(null);continue}
      if(i===0)d=ch+[0,2,4][r()*3|0];else d+=[-2,-1,-1,1,1,2,0][r()*7|0];d=clamp(d,ch-3,ch+9);
      out.push({d,len:(r()<.25&&i<7)?2:1})}}return out};
  const A=phrase(),B=phrase();for(let i=24;i<32;i++)B[i]=A[i];/* same ending, so it sounds like a tune */
  return{T,deg,mel:A.concat(B)};
}
function rpVoice(a,dest,f,t,dur,type,vol){const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.setValueAtTime(vol,t+dur*.7);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.02)}
function rpDrum(a,dest,kind,t){
  if(!rpMus.noise){const b=a.createBuffer(1,a.sampleRate*.3,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;rpMus.noise=b}
  if(kind==='k'){const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(dest);o.start(t);o.stop(t+.16);return}
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=rpMus.noise;f.type=kind==='h'?'highpass':'bandpass';f.frequency.value=kind==='h'?7000:kind==='d'?2200:1800;
  const len=kind==='h'?.04:kind==='d'?.09:.12;g.gain.setValueAtTime(kind==='h'?.25:kind==='d'?.18:.5,t);g.gain.exponentialRampToValueAtTime(.001,t+len);s.connect(f);f.connect(g);g.connect(dest);s.start(t);s.stop(t+len+.02)}
const RP_DRUMS={/* 16 steps per bar: k kick, s snare, h hat, d drip */
  light:['k','','h','','s','','h','','k','','h','k','s','','h',''],bounce:['k','','h','k','s','','h','','k','k','h','','s','','h','h'],
  soft:['k','','','','h','','','','s','','','','h','','',''],drip:['','','','','d','','','','','','d','','','','',''],
  march:['k','','s','','k','','s','s','k','','s','','k','s','s','s'],drive:['k','h','s','h','k','k','s','h','k','h','s','h','k','k','s','s']};
function rpMusicWant(){
  if(!soundOn||rp.headless||rpOpt.music===false||view!=='rpg'||!rp.s)return null;
  if(rp.mode==='battle'&&rp.bt)return rp.bt.boss?'boss':'battle';
  const a=rpArea(rp.s.x,rp.s.y);return a==='Burrowhome'?'village':a==='Whisper Woods'||a==='Wildwood'?'woods':a==='Mushroom Cave'?'cave':a==="Dragon's Hoard"?'hoard':'meadow'}
function rpMusicTick(){
  const want=rpMusicWant(),a=ac;
  if(!want){if(rpMus.g&&a){rpMus.g.gain.setTargetAtTime(0,a.currentTime,.15);rpMus.g=null;rpMus.key=null}return}
  const A=audio();if(!A)return;if(A.state==='suspended')A.resume();
  if(want!==rpMus.key){if(rpMus.g)rpMus.g.gain.setTargetAtTime(0,A.currentTime,.2);
    const g=A.createGain();g.gain.setValueAtTime(0,A.currentTime);g.gain.linearRampToValueAtTime(.09,A.currentTime+.6);g.connect(A.destination);
    rpMus.g=g;rpMus.key=want;rpMus.song=rpSong(RP_TRACKS[want]);rpMus.step=0;rpMus.next=A.currentTime+.08}
  const S=rpMus.song,T=S.T,st=60/T.bpm/4,dest=rpMus.g;
  while(rpMus.next<A.currentTime+.18){
    const i=rpMus.step,t=rpMus.next,bar=(i>>4)%8,s16=i%16,ch=T.prog[bar%4];
    if(s16%2===0){const m=S.mel[bar*8+(s16>>1)];if(m)rpVoice(A,dest,mtof(S.deg(m.d,1)),t,st*2*m.len*.92,T.lead,.16*T.vol)}
    if(s16%4===0)rpVoice(A,dest,mtof(S.deg(ch,-1)),t,st*(T.dr==='drip'?7:3.6),'triangle',.42*T.vol);
    if(T.dr==='drive'&&s16%4===2)rpVoice(A,dest,mtof(S.deg(ch,-1)+12),t,st*1.6,'triangle',.3*T.vol);
    if(s16===0&&bar%2===0)[0,2,4].forEach(o=>rpVoice(A,dest,mtof(S.deg(ch+o,0)),t,st*15,'sine',.05*T.vol));
    const dk=RP_DRUMS[T.dr][s16];if(dk)rpDrum(A,dest,dk,t);
    rpMus.step++;rpMus.next+=st;
  }
}

feature({id:'music',frame:()=>rpMusicTick()});
export {RP_DRUMS,RP_SCALES,RP_TRACKS,mtof,rpDrum,rpMus,rpMusicTick,rpMusicWant,rpSong,rpVoice};
