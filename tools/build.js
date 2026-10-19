/* Build: bundle src/ into one script, join styles/, drop both into index.html.
   dist/kobold-quest.html is what gets published; dist/kq_test.html adds test hooks and a doctype. */
const fs=require('fs'),path=require('path'),esbuild=require('esbuild');
const R=path.join(__dirname,'..');
const order=JSON.parse(fs.readFileSync(R+'/styles/order.json','utf8'));
const css=order.map(f=>fs.readFileSync(R+'/styles/'+f,'utf8').trim()).join('\n');
/* a missing } in one sheet silently breaks every sheet after it: refuse to build */
for(const f of order){const t=fs.readFileSync(R+'/styles/'+f,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/"[^"]*"/g,'');let d=0;for(const c of t){if(c==='{')d++;else if(c==='}')d--;if(d<0)break}if(d!==0)throw new Error('styles/'+f+': unbalanced { } ('+d+')')}
const tpl=fs.readFileSync(R+'/index.html','utf8');
/* every build gets an id; the server hands it out and pages from an older build reload themselves */
const BUILD_ID=process.env.KQ_BUILD||new Date().toISOString().slice(0,19)+'Z';
/* Joakim's drawings: built into the page (the Claude page has no server to fetch them from); the website fetches its own */
const {templateHashes,isPlaceholder}=require('../server/art.js'),TPL=templateHashes(R+'/art/templates');
function artFrom(dir){const out={};if(!fs.existsSync(dir))return out;for(const f of fs.readdirSync(dir).sort())if(/^[a-z0-9-]+\.png$/.test(f)){const b=fs.readFileSync(path.join(dir,f));if(!isPlaceholder(b,TPL))out[f.slice(0,-4)]='data:image/png;base64,'+b.toString('base64')}return out}
const ART=artFrom(R+'/art/sprites'),TEST_ART=artFrom(R+'/test/fixtures/art');
function bundle(test,site){return esbuild.buildSync({entryPoints:[R+'/src/main.js'],bundle:true,format:'iife',target:'es2020',write:false,
  define:{TEST:test?'true':'false',SITE:site?'true':'false',BUILD_ID:JSON.stringify(BUILD_ID),KQ_ART:site?'null':JSON.stringify(test?TEST_ART:ART)},minifySyntax:!test,legalComments:'none',charset:'utf8'}).outputFiles[0].text}
fs.mkdirSync(R+'/dist',{recursive:true});
const page=js=>tpl.replace('/*CSS*/',()=>css).replace('/*JS*/',()=>js.replace(/<\/script/gi,'<\\/script'));
const prod=page(bundle(false));fs.writeFileSync(R+'/dist/kobold-quest.html',prod);
fs.writeFileSync(R+'/dist/kq_test.html','<!doctype html><html lang="en"><head><meta charset="utf-8">\n'+page(bundle(true))+'\n</html>');
/* the website: same game, logs in to the server in server/ */
fs.mkdirSync(R+'/server/public',{recursive:true});
const site='<!doctype html><html lang="en"><head><meta charset="utf-8">\n'+page(bundle(false,true))+'\n</html>';fs.writeFileSync(R+'/server/public/index.html',site);
fs.writeFileSync(R+'/dist/kq_site_test.html','<!doctype html><html lang="en"><head><meta charset="utf-8">\n'+page(bundle(true,true))+'\n</html>');
fs.writeFileSync(R+'/dist/BUILD',BUILD_ID);
console.log('built',(prod.length/1024).toFixed(0)+' KB');
/* the list of drawings the game can use (art/WANTED.md) */
{const {artList,makePlaceholders}=require('./artlist.js');const L=artList(require(R+'/test/lib/game.js')());fs.writeFileSync(R+'/art/WANTED.md',L.md);makePlaceholders(L.rows)}
