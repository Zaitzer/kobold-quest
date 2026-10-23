/* The roster: Pip travels with up to two others; everyone else waits at the inn (any innkeeper opens this screen).
   Kobolds waiting at the inn get half the XP of each won battle, so nobody falls far behind. */
import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {esc2} from '../engine/util.js';
import {rpClsName} from '../game/stats.js';
import {rpUI} from './hud.js';

const PARTY_MAX=3;
function rpOpenRoster(){rp.mode='roster';rpUI(true)}
function rosterLine(m){return esc2(m.name)+' · '+rpClsName(m)+' '+m.lvl}
function rosterHtml(){const s=rp.s,bench=s.roster||[],full=s.party.length>=PARTY_MAX;
  return '<div class="rpdlg"><div class="who">Who comes along?</div><p>Three can travel together. The rest wait at the inn and learn from your stories (half the XP of every fight).</p></div><div class="rpcmd">'+
    s.party.map((m,i)=>i===0?'<button class="rpb" type="button" disabled>'+rosterLine(m)+'<small>Always comes along</small></button>':
      '<button class="rpb x" type="button" data-rp="rostout" data-i="'+i+'">'+rosterLine(m)+'<small>Send to wait at the inn</small></button>').join('')+
    bench.map((m,i)=>'<button class="rpb go" type="button" data-rp="rostin" data-i="'+i+'"'+(full?' disabled':'')+'>'+rosterLine(m)+'<small>'+(full?'The party is full: send someone to the inn first':'Bring along')+'</small></button>').join('')+
    '<button class="rpb x" type="button" data-rp="rostclose">Done</button></div>'}
/* someone joins: into the party if there's room, otherwise they wait at the inn */
function rpJoinRoster(m){const s=rp.s;if(s.party.length<PARTY_MAX){s.party.push(m);return'party'}s.roster=(s.roster||[]).concat([m]);return'inn'}
/* half the XP of a won fight for everyone waiting at the inn */
function rpBenchXp(xp,need){for(const m of rp.s.roster||[]){m.xp+=Math.round(xp/2);while(m.xp>=need(m.lvl)){m.xp-=need(m.lvl);m.lvl++;m.pend=(m.pend||0)+1}}}
feature({id:'roster',
  panels:{roster:{sig:()=>rp.s.party.map(m=>m.name).join()+'|'+(rp.s.roster||[]).map(m=>m.name).join(),html:rosterHtml}},
  actions:{
    rostout:d=>{const s=rp.s,i=+d.i;if(i<1||!s.party[i])return;s.roster=(s.roster||[]).concat(s.party.splice(i,1));rpSave()},
    rostin:d=>{const s=rp.s,b=s.roster||[],i=+d.i;if(!b[i]||s.party.length>=PARTY_MAX)return;s.party.push(b.splice(i,1)[0]);rpSave()},
    rostclose:()=>{rp.mode='map';rpSave()}}});
export {PARTY_MAX,rosterHtml,rosterLine,rpBenchXp,rpJoinRoster,rpOpenRoster};
