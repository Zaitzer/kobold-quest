/* dialogue */
import {rpInputReset} from '../core/input.js';
import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {sfx} from '../engine/audio.js';
import {esc2} from '../engine/util.js';
import {rpUI} from '../ui/hud.js';

function rpSay(lines,choices,after){if(typeof rpInputReset==='function')rpInputReset();rp.dlg={lines:lines.map(l=>typeof l==='string'?{who:'',text:l}:l),i:0,choices:choices||null,after:after||null};rp.mode='dialog';rpUI(true)}
function rpDlgNext(){const d=rp.dlg;if(!d)return;if(d.i<d.lines.length-1){d.i++;rpUI(true);return}if(d.choices)return;rp.dlg=null;rp.mode='map';rpSave();if(d.after)d.after();rpUI(true)}
function rpChoose(i){const d=rp.dlg;if(!d||!d.choices)return;const c=d.choices[i];if(!c||(c.ok&&!c.ok()))return;rp.dlg=null;rp.mode='map';c.fn&&c.fn();rpSave();rpUI(true)}
function rpToast(t){rp.toast={t,life:2.6};if(!rp.headless)sfx('drop')}

feature({id:'dialogue',
  panels:{dialog:{sig:()=>rp.dlg?rp.dlg.i+'|'+rp.dlg.lines[rp.dlg.i].text:'',html(){const d=rp.dlg;if(!d)return null;const l=d.lines[d.i];
    return '<div class="rpdlg">'+(l.who?'<div class="who">'+esc2(l.who)+'</div>':'')+'<p>'+esc2(l.text)+'</p><div class="rpch">'+
      (d.i<d.lines.length-1||!d.choices?'<button class="pill go" type="button" data-rp="next">Next ▸</button>':d.choices.map((c,i)=>'<button class="pill'+(i?'':' go')+'" type="button" data-rp="choose" data-i="'+i+'"'+(c.ok&&!c.ok()?' disabled':'')+'>'+esc2(c.t)+'</button>').join(''))+'</div></div>'}}},
  actions:{next:()=>rpDlgNext(),choose:d=>rpChoose(+d.i)}});
export {rpChoose,rpDlgNext,rpSay,rpToast};
