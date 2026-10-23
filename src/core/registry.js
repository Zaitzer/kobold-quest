/* The feature registry. Every feature describes itself with feature({...}) and the core
   wires it in: no central switch statement needs editing when something new is added.

   feature({
     id:'market',                 // unique name; FLAGS[id]===false switches the whole feature off
     panels:{market:{sig,html}},  // side sheets, keyed by rp.mode; sig() says when to redraw
     actions:{buy(d){...}},       // buttons with data-rp="buy"
     routes:{net(d){...}},        // buttons with a data-net="..." attribute go to this handler
     menu:[{order,html()}],       // extra buttons in the ☰ menu
     options:[{id,order,label(),hint,toggle()}], // settings rows in the menu
     net:{gift(d,msg){}},         // online messages by type
     on:{'battle:won'(b){}},      // event bus listeners
     frame(dt){},                 // runs every frame while playing
     init(){}                     // runs once at boot, after every module has loaded
   })
*/
import {on} from './bus.js';

/* feature switches: {fishing:false} keeps that feature from registering anything */
export const FLAGS={};
export const panels={},actions={},routes={},netHandlers={};
export const menuItems=[],options=[],frames=[],inits=[],features={};
export function feature(f){
  if(features[f.id])throw Error('feature '+f.id+' registered twice');
  features[f.id]=f;if(FLAGS[f.id]===false)return f;
  const put=(dst,src,kind)=>{for(const k in src||{}){if(dst[k])throw Error(kind+' "'+k+'" taken (by '+f.id+')');dst[k]=src[k]}};
  put(panels,f.panels,'panel');put(actions,f.actions,'action');put(routes,f.routes,'route');put(netHandlers,f.net,'net message');
  (f.menu||[]).forEach(m=>menuItems.push(m));(f.options||[]).forEach(o=>options.push(o));
  for(const ev in f.on||{})on(ev,f.on[ev]);
  if(f.frame)frames.push(f.frame);if(f.init)inits.push(f.init);
  menuItems.sort((a,b)=>(a.order||0)-(b.order||0));options.sort((a,b)=>(a.order||0)-(b.order||0));
  return f;
}
export function enabled(id){return !!features[id]&&FLAGS[id]!==false}
