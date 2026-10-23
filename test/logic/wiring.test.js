/* Wiring: every button in the source has a handler registered, every screen a panel. */
const fs=require('fs'),path=require('path');const G=require('../lib/game.js')();
const src=[];(function scan(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())scan(p);else if(f.endsWith('.js'))src.push(fs.readFileSync(p,'utf8'))}})(path.join(__dirname,'../../src'));
const all=src.join('\n').replace(/\/\*[\s\S]*?\*\//g,'');let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const R={actions:G.actions,routes:G.routes,panels:G.panels};
for(const m of all.matchAll(/data-rp="([a-z]+)"/g))if(!R.actions[m[1]])bad('data-rp="'+m[1]+'" has no action');
for(const m of all.matchAll(/data-net="([a-z?]+)"/g))if(!R.actions['net:'+m[1]])bad('data-net="'+m[1]+'" has no net action');
for(const m of all.matchAll(/data-(tac|g|opt|dir)=/g))if(!R.routes[m[1]])bad('data-'+m[1]+' has no route');
for(const m of all.matchAll(/rp\.mode='([a-z]+)'/g))if(!R.panels[m[1]]&&m[1]!=='map')bad("mode '"+m[1]+"' has no panel");
console.log(fails?'FAIL':'ok','wiring:',Object.keys(R.actions).length,'actions,',Object.keys(R.panels).length,'panels,',fails,'problems');process.exitCode=fails?1:0;
