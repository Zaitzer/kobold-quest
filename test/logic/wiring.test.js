/* Wiring: every button in the source has a handler registered, every special map tile has a feature, no orphans. */
const fs=require('fs'),path=require('path');const G=require('../lib/game.js')();
const src=[];(function scan(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())scan(p);else if(f.endsWith('.js'))src.push(fs.readFileSync(p,'utf8'))}})(path.join(__dirname,'../../src'));
const all=src.join('\n').replace(/\/\*[\s\S]*?\*\//g,'');let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const R={actions:G.actions,routes:G.routes,tiles:G.tiles,panels:G.panels};
for(const m of all.matchAll(/data-rp="([a-z]+)"/g))if(!R.actions[m[1]])bad('data-rp="'+m[1]+'" has no action');
for(const m of all.matchAll(/data-net="([a-z?]+)"/g))if(!R.actions['net:'+m[1]])bad('data-net="'+m[1]+'" has no net action');
for(const m of all.matchAll(/data-(tac|g|opt|dir)=/g))if(!R.routes[m[1]])bad('data-'+m[1]+' has no route');
for(const m of all.matchAll(/rp\.mode='([a-z]+)'/g))if(!R.panels[m[1]]&&m[1]!=='map')bad("mode '"+m[1]+"' has no panel");
const grid=G.rpBuildWorld();G.rpWorldExtras(grid);const letters=new Set(grid.flat());
for(const c of ['d','X','S','N','A','M'])if(letters.has(c)&&!R.tiles[c])bad('tile '+c+' has no feature');
for(const t of Object.keys(R.tiles))if(!letters.has(t)&&t!=='X')bad('tile feature '+t+' is not on the map');
console.log(fails?'FAIL':'ok','wiring:',Object.keys(R.actions).length,'actions,',Object.keys(R.panels).length,'panels,',Object.keys(R.tiles).length,'tiles,',fails,'problems');process.exitCode=fails?1:0;
