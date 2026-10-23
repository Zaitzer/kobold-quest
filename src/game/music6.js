/* ---------- Kobold Quest v6: which music plays where, and the sounds the story cues (build step 18, audio-plan.md) ----------
   One rule per place: Hearthspire has four versions of one tune (the morning, under the guards, the empty square, everyone came);
   the castle; Glitterbeak whenever he speaks; Mallow hums the rhyme in the bakery; the tower has only its fire; Pebblebrook's drums
   are the mill wheel, so they are missing until the wheel turns (rule 5); R1 the meadow; the mine its cave, the dark floor thinner. */
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {LINKS6} from '../data/v6/maps.js';
import {sfx} from '../engine/audio.js';
import {w6Place} from './world6.js';

const YARD=[14,5,25,12];   // the castle yard on Hearthspire's map (the Nest, the drill)
const MILL=(()=>{const L=LINKS6.find(l=>l[0]==='pebblebrook'&&l[3]==='room:mill');return L?[L[1],L[2]]:null})();
/* the track (and an ambient loop) for this moment; a pure function of the game's state so the test can ask it */
function v6Music(){const s=rp.s,q=s.q||{},p=s.w6||'',b=rp.bt,d=rp.dlg,line=d&&d.lines[d.i];
  if(rp.mode==='battle'&&b)return{key:b.boss?(/snatchclaw/i.test(b.boss)?'castle_boss':'boss'):'battle'};
  if(line&&/^glitterbeak$/i.test(line.who||''))return{key:'glitterbeak'};
  /* a place's own track, or its town's (both set in the map editor: world/) */
  const P=w6Place(p)||{};if(P.music)return P.music.amb?{key:P.music.key,amb:P.music.amb}:{key:P.music.key};
  const town=P.town==='hearthspire',pebble=P.town==='pebblebrook';
  if(town){if(q.march)return{key:'hs_all'};if(q.empty)return{key:'hs_empty'};
    if(p==='hearthspire'&&s.x>=YARD[0]&&s.x<=YARD[2]&&s.y>=YARD[1]&&s.y<=YARD[3])return{key:'castle'};
    return{key:(q.act||0)>=5?'hs_guards':'hs_morning'}}   // the hatching (§1.8) sets act 5
  if(pebble){const turning=(q.pb||0)>=6,near=MILL&&p==='pebblebrook'&&Math.hypot(s.x-MILL[0],s.y-MILL[1])<=7;return{key:turning?'pebble_wheel':'pebble',amb:turning&&near?'wheel':null}}
  return{key:'meadow'}}
/* sounds the script cues, line by line: the egg's CRACK, Glitterbeak's roar the first time he speaks in a conversation and a greedy
   low blip on every MINE, Mallow's rhyme when she sings, a clack for each stone at the circle, a skree for the raptors */
const CUES=[[l=>/\bCRACK\b/.test(l.text),'crack'],[l=>/glitterbeak/i.test(l.who||'')&&/\bmine\b/i.test(l.text),'mine'],
  [l=>/singing|hums?\b/i.test(l.text)&&/mallow/i.test(l.who||''),'rhyme'],[l=>/\bstones?\b/i.test(l.text)&&/circle|clack|vote|drop/i.test(l.text),'clack'],[l=>/\bskree\b/i.test(l.text),'skree']];
function v6Cue(line,first){if(!line)return null;if(first&&/glitterbeak/i.test(line.who||''))return'roar';for(const [t,k] of CUES)if(t(line))return k;return null}
let lastDlg=null;
feature({id:'music6',on:{'dlg:line':line=>{if(!rp.s||!rp.s.w6)return;const d=rp.dlg,first=d&&d!==lastDlg&&!d.lines.slice(0,d.i).some(l=>/glitterbeak/i.test(l.who||''));
    if(/glitterbeak/i.test(line.who||''))lastDlg=d;const k=v6Cue(line,first);if(k)sfx(k)},
  'w6:piece':()=>sfx('spark'),'w6:stable':()=>sfx('skree'),'w6:door':()=>sfx('door'),'w6:chest':()=>sfx('chest'),'w6:sound':k=>sfx(k),
  'battle:won':b=>{if(b&&b.v6&&b.ups6&&b.ups6.length)setTimeout(()=>sfx('level'),700)}}});
export {CUES,MILL,YARD,lastDlg,v6Cue,v6Music};
