/* Building the panels' HTML: one way to write a button, a row of buttons and a panel, so every screen escapes what it shows, names
   its action the same way and keeps one look (styles/hud.css). The action is a feature's action ('w6buy': data-rp, ui/hud.js finds it
   in the registry) or a routed one ('net:give', 'tac:ok', 'opt:calm', 'g:...': data-net, data-tac, data-opt, data-g).
   Labels and the small line under them are escaped; {raw:true} takes them as HTML (a bold part, an icon). */
import {esc2} from './util.js';

const ROUTED=new Set(['net','tac','opt','g']);
function button(action,label,o){o=o||{};const i=String(action).indexOf(':'),route=i>0&&ROUTED.has(action.slice(0,i))?action.slice(0,i):'rp',name=route==='rp'?action:action.slice(i+1);
  const text=v=>o.raw?String(v):esc2(String(v));
  return'<button class="'+(o.pill?'pill':'rpb')+(o.cls?' '+o.cls:'')+'" type="button" data-'+route+'="'+esc2(name)+'"'+(o.v!=null?' data-v="'+esc2(String(o.v))+'"':'')+
    Object.entries(o.data||{}).map(([k,x])=>' data-'+k+'="'+esc2(String(x))+'"').join('')+(o.disabled?' disabled':'')+(o.aria?' aria-label="'+esc2(o.aria)+'"':'')+'>'+
    text(label)+(o.sub!=null&&o.sub!==''?'<small>'+text(o.sub)+'</small>':'')+'</button>'}
/* a row of buttons */
function buttons(list){return'<div class="rpcmd">'+list.join('')+'</div>'}
/* a panel with a title (escaped) and its body (HTML) */
function panel(title,body){return'<div class="rpdlg"><div class="who">'+esc2(title)+'</div>'+(body||'')+'</div>'}
export {ROUTED,button,buttons,panel};
