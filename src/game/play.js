import {rpDrawBattle} from '../battle/draw.js';
import {rpBattleStep} from '../battle/flow.js';
import {set_uiT,show,uiT} from '../core/app.js';
import {emit} from '../core/bus.js';
import {rpGoFull,rpLayout,rpResize} from '../core/layout.js';
import {feature,frames} from '../core/registry.js';
import {rpLoad,rpSave} from '../core/save.js';
import {rp,rpApplyWorld,rpNewState} from '../core/state.js';
import {parts,texts} from '../engine/fx.js';
import {$} from '../engine/util.js';
import {rpSay} from './dialogue.js';
import {rpMoveFrame} from './move.js';
import {rpPendingMember,rpPromoteWho} from './promote.js';
import {rpDrawMap} from '../render/map.js';
import {rpUI} from '../ui/hud.js';
function rpIntro(){rpSay([{who:'',text:'Burrowhome is a sleepy kobold village, and today is hatching day: once in a lifetime the village hatches a dragon to guard the kobolds, from one of three dragon eggs.'},{who:'',text:'You are Pip: a small kobold with a big stick and strong opinions. Every morning Old Mallow bakes, and every morning Pip eats two ember-buns. Life is good.'},{who:'',text:'Elder Mumble is waiting by his house, just south of here.'},{who:'',text:'Walk with the arrows (or the keyboard), or tap anywhere on the map. Bump into someone to talk.'}],null,()=>{rp.s.q.intro=1;rp.mode='class';rpSave();rpUI(true)})}
function rpStart(fresh){
  const sv=fresh?null:rpLoad();rp.s=sv||rpNewState();rpApplyWorld();rp.mode='map';rp.bt=null;$('rp-hero').hidden=true;rp.dlg=null;rp.pk=null;rp.npcK={};rp.grace=4;rp.pos=null;rp.path=null;rp.keys.clear();rp.sig='';parts.length=0;texts.length=0;
  show('rpg');rpLayout();requestAnimationFrame(()=>{rpResize();rpUI(true)});
  emit('game:start');
  if(!rp.s.q.intro)rpIntro();else rpUI(true);
}
function rpFrame(dt){
  rp.t+=dt;
  if(rp.mode==='map'&&!rp.s.w6){if(rp.s.q.intro&&!rp.s.q.cls){rp.mode='class';rpUI(true)}else if(rpPendingMember()){rp.mode='levelup';rp.held=null;rp.path=null;rpUI(true)}else if(rpPromoteWho()){rp.mode='promote';rp.held=null;rp.path=null;rpUI(true)}}
  if(rp.mode==='map')rpMoveFrame(dt);
  if(rp.mode==='battle')rpBattleStep(dt);
  if(rp.mode==='battle'&&rp.bt)rpDrawBattle();else rpDrawMap(dt);
  set_uiT(uiT+(dt));if(uiT>.15){set_uiT(0);rpUI()}
  for(const f of frames)f(dt);
}
feature({id:'game-play',init(){
$('go-rpg').addEventListener('click',()=>{rpGoFull();rpStart(false)});
}});
export {rpFrame,rpIntro,rpStart};
