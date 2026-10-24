/* Build: bundle src/ into one script, join styles/, drop both into index.html.
   server/public/index.html is the website (the only place the game is played); dist/kq_test.html is the test build (test hooks, a mock
   server, test sheets built in); dist/kq_site_test.html is the website with test hooks, for tsite. */
const fs=require('fs'),path=require('path'),esbuild=require('esbuild');
const R=path.join(__dirname,'..');
const order=JSON.parse(fs.readFileSync(R+'/styles/order.json','utf8'));
const css=order.map(f=>fs.readFileSync(R+'/styles/'+f,'utf8').trim()).join('\n');
/* a missing } in one sheet silently breaks every sheet after it: refuse to build */
for(const f of order){const t=fs.readFileSync(R+'/styles/'+f,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/"[^"]*"/g,'');let d=0;for(const c of t){if(c==='{')d++;else if(c==='}')d--;if(d<0)break}if(d!==0)throw new Error('styles/'+f+': unbalanced { } ('+d+')')}
const tpl=fs.readFileSync(R+'/index.html','utf8');
/* every build gets an id; the server hands it out and pages from an older build reload themselves */
const BUILD_ID=process.env.KQ_BUILD||new Date().toISOString().slice(0,19)+'Z';
/* the website fetches Joakim's sheets (art/) from the server; the test build carries test sheets (test/fixtures/art) built in */
const {sheets}=require('../server/art.js');
const TEST_ART={};for(const [key,b] of sheets(R+'/test/fixtures/art'))TEST_ART[key]='data:image/png;base64,'+b.toString('base64');
function bundle(test,site){return esbuild.buildSync({entryPoints:[R+'/src/main.js'],bundle:true,format:'iife',target:'es2020',write:false,
  define:{TEST:test?'true':'false',SITE:site?'true':'false',BUILD_ID:JSON.stringify(BUILD_ID),KQ_ART:site?'null':JSON.stringify(TEST_ART)},minifySyntax:!test,minifyWhitespace:!test,legalComments:'none',charset:'utf8'}).outputFiles[0].text}
fs.mkdirSync(R+'/dist',{recursive:true});
const page=js=>tpl.replace('/*CSS*/',()=>css).replace('/*JS*/',()=>js.replace(/<\/script/gi,'<\\/script'));
fs.writeFileSync(R+'/dist/kq_test.html','<!doctype html><html lang="en"><head><meta charset="utf-8">\n'+page(bundle(true))+'\n</html>');
/* the website: same game, logs in to the server in server/ */
fs.mkdirSync(R+'/server/public',{recursive:true});
const site='<!doctype html><html lang="en"><head><meta charset="utf-8">\n'+page(bundle(false,true))+'\n</html>';fs.writeFileSync(R+'/server/public/index.html',site);
fs.writeFileSync(R+'/dist/kq_site_test.html','<!doctype html><html lang="en"><head><meta charset="utf-8">\n'+page(bundle(true,true))+'\n</html>');
fs.writeFileSync(R+'/dist/BUILD',BUILD_ID);
console.log('built',(site.length/1024).toFixed(0)+' KB');
