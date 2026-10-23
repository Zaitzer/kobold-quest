/* ---------- Kobold Quest v6: down, losing, fleeing, retries, recovery after a fight (systems.md §4, §5; build step 10) ---------- */
import {rpBattle} from './flow.js';
import {v6BossKey} from './v6battle.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {rpStats} from '../game/stats.js';
import {v6LevelUp} from '../game/v6talent.js';

/* a fall: −1 to the kobold's streak (morale), and the fight is no longer clean */
function v6Fall(b,t){if(!b||!b.v6||t.side!==0||!t.m)return;t.m.streak=(t.m.streak||0)-1;b.falls=(b.falls||0)+1}
/* leaving the field while a friend is down: deed 5 in corruption.md (+2 to the kobold who leaves) */
function v6Leave(b,u){if(!b||!b.v6||!u.m)return;if(b.units.some(v=>v.side===0&&v!==u&&v.hp<=0&&!v.fled)){u.m.corr=(u.m.corr||0)+2;b.msg=u.name+' leaves a friend behind… (corruption +2)'}}
/* after a win: 10% of max mana back, no HP; a clean win (nobody fell) is +1 streak, at most +3 */
function v6Won(b){if(!b||!b.v6)return;b.units.filter(u=>u.side===0&&u.m).forEach(u=>{const m=u.m,st=rpStats(m);m.mp=Math.min(st.mp,(m.mp||0)+Math.round(st.mp*0.1));
  if(!b.falls)m.streak=Math.min(3,(m.streak||0)+1)})}
/* losing to a boss: 10% softer next time (never under 70%, `v6Soft`) */
function v6Lost(b){if(!b||!b.v6)return;const boss=b.units.find(u=>u.E&&u.E.v6boss);if(!boss||!rp.s)return;rp.s.bossDefeats=rp.s.bossDefeats||{};rp.s.bossDefeats[boss.E.id]=(rp.s.bossDefeats[boss.E.id]||0)+1}
/* the start of a fight, kept so a boss or set piece can be retried at once: HP and mana as they were; potions used stay used */
function v6Keep(b,keys,opt){if(!b||!b.v6)return;b.start6={keys:keys.slice(),opt:Object.assign({},opt),hm:(opt.members||[]).map(x=>[x.m,x.m.hp,x.m.mp])}}
function v6CanRetry(b){return!!(b&&b.v6&&b.over==='lose'&&b.start6&&(b.boss||b.start6.opt.setPiece))}
function v6Retry(){const b=rp.bt;if(!v6CanRetry(b))return false;const S=b.start6;S.hm.forEach(([m,hp,mp])=>{m.hp=hp;m.mp=mp});
  const boss=b.units.find(u=>u.E&&u.E.v6boss),keys=boss?[v6BossKey(boss.E.id)]:S.keys;   // a boss's entry is rebuilt so its softening counts
  rp.bt=null;rp.mode='map';rpBattle(keys,boss?Object.assign({},S.opt,{boss:keys[0]}):S.opt);if(rp.bt){rp.bt.v6=1;for(const k of ['story','patrol','xpMul'])if(b[k]!=null)rp.bt[k]=b[k]}/* story fights set b.story after the start */return true}
/* the end: a downed kobold stands with 1 HP (carried out when the pack fled); after a loss everyone is healed at the fountain */
function v6End(b){if(!b||!b.v6)return;b.units.filter(u=>u.side===0&&u.m).forEach(u=>{const m=u.m;if(b.over==='lose'){const st=rpStats(m);m.hp=st.hp;m.mp=st.mp}else if(m.hp<=0)m.hp=1})}
/* XP (balance.md §3, the level table: XP to the next level = 12 × L^1.6): every kobold in the fight gets the fight's XP, the downed too
   (systems.md §4); a level brings its pick (v6LevelUp) */
const v6XpNeed=L=>Math.round(12*Math.pow(L,1.6));
function v6GiveXp(b,xp,ups){const mine=b.net&&b.net.role==='guest'?'g':'h';   /* XP is personal (systems.md §12): only this player's kobolds */
  b.units.filter(u=>u.side===0&&u.m&&u.m.v6&&!u.fled&&(u.own||'h')===mine).forEach(u=>{const m=u.m;if(m.hp<=0)m.hp=1;m.xp=(m.xp||0)+xp;
  while(m.lvl<30&&m.xp>=v6XpNeed(m.lvl)){m.xp-=v6XpNeed(m.lvl);v6LevelUp(m);ups.push(m.name+' reached level '+m.lvl+'!')}})}
feature({id:'v6end',on:{'battle:won':b=>v6Won(b),'battle:lost':b=>v6Lost(b),'battle:end':b=>v6End(b)}});
export {v6CanRetry,v6End,v6Fall,v6GiveXp,v6Keep,v6Leave,v6Lost,v6Retry,v6Won,v6XpNeed};
