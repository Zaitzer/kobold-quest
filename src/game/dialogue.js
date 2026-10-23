/* dialogue */
import {emit} from '../core/bus.js';
import {rpInputReset,rpUI} from '../core/hooks.js';
import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {sfx} from '../engine/audio.js';
import {button} from '../engine/html.js';
import {esc2} from '../engine/util.js';

function rpSay(lines,choices,after){if(typeof rpInputReset==='function')rpInputReset();rp.dlg={lines:lines.map(l=>typeof l==='string'?{who:'',text:l}:l),i:0,choices:choices||null,after:after||null};rp.mode='dialog';rpBlip();rpUI(true)}
function rpDlgNext(){const d=rp.dlg;if(!d)return;if(d.i<d.lines.length-1){d.i++;rpBlip();rpUI(true);return}if(d.choices)return;rp.dlg=null;rp.mode='map';rpSave();if(d.after)d.after();rpUI(true)}
function rpChoose(i){const d=rp.dlg;if(!d||!d.choices)return;const c=d.choices[i];if(!c||(c.ok&&!c.ok()))return;rp.dlg=null;rp.mode='map';c.fn&&c.fn();rpSave();rpUI(true)}
/* a soft blip per line; each speaker has their own pitch */
function blipPitch(who){let h=0;for(const c of who||'')h=(h*31+c.charCodeAt(0))|0;return who?.8+((h>>>0)%9)*.07:1}
function rpBlip(){const d=rp.dlg;if(d)emit('dlg:line',d.lines[d.i]);if(!rp.headless&&d)sfx('blip',blipPitch(d.lines[d.i].who))}
function rpToast(t){rp.toast={t,life:2.6};if(!rp.headless)sfx('drop')}

feature({id:'dialogue',
  panels:{dialog:{sig:()=>rp.dlg?rp.dlg.i+'|'+rp.dlg.lines[rp.dlg.i].text:'',html(){const d=rp.dlg;if(!d)return null;const l=d.lines[d.i];
    return '<div class="rpdlg">'+(l.who?'<div class="who">'+esc2(l.who)+'</div>':'')+'<p>'+esc2(l.text)+'</p><div class="rpch">'+
      (d.i<d.lines.length-2?button('dlgskip','Skip ▸▸',{pill:1}):'')+(d.i<d.lines.length-1||!d.choices?button('next','Next ▸',{cls:'go',pill:1}):d.choices.map((c,i)=>button('choose',esc2(c.t),{cls:i?'':'go',pill:1,data:{'i':i},disabled:c.ok&&!c.ok(),raw:1})).join(''))+'</div></div>'}}},
  actions:{dlgskip:()=>{const d=rp.dlg;if(d){d.i=d.lines.length-1;if(!d.choices)rpDlgNext();rpUI(true)}},next:()=>rpDlgNext(),choose:d=>rpChoose(+d.i)}});
export {blipPitch,rpBlip,rpChoose,rpDlgNext,rpSay,rpToast};
