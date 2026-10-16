/* A tiny event bus. Systems announce what happened ('battle:won', 'tile:enter', 'save'...)
   and anything can listen, so a new feature never has to edit the system it reacts to. */
const subs={};
export function on(ev,fn){(subs[ev]=subs[ev]||[]).push(fn);return()=>off(ev,fn)}
export function off(ev,fn){const a=subs[ev];if(a){const i=a.indexOf(fn);if(i>=0)a.splice(i,1)}}
export function emit(ev,...args){const a=subs[ev];if(!a)return;for(const fn of a.slice()){try{fn(...args)}catch(e){console.error('['+ev+']',e)}}}
export {subs};
