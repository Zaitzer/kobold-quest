/* Drawings: the server's art step copies good PNGs and skips bad files with a reason; every drawing in art/sprites is a
   valid PNG with a name the game uses; and the wanted list covers every villager, monster met and tile. */
const fs=require('fs'),path=require('path'),os=require('os');let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const {prepare}=require('../../server/art.js');const {artList}=require('../../tools/artlist.js');const G=require('../lib/game.js')();
const R=path.join(__dirname,'../..'),T=fs.mkdtempSync(path.join(os.tmpdir(),'kqart-')),from=path.join(T,'in'),to=path.join(T,'out');
fs.mkdirSync(from);fs.copyFileSync(path.join(R,'test/fixtures/art/pip.png'),path.join(from,'pip.png'));
fs.copyFileSync(path.join(R,'test/fixtures/art/pip.png'),path.join(from,'Pip Final.png'));fs.writeFileSync(path.join(from,'fake.png'),'not a png');
const r=prepare(from,to),m=JSON.parse(fs.readFileSync(path.join(to,'manifest.json'),'utf8'));
if(r.count!==1||!m.pip||m.pip.w!==128||m.pip.h!==128||!/^[0-9a-f]{8}$/.test(m.pip.v))bad('manifest: '+JSON.stringify(m));
if(r.warn.length!==2)bad('expected 2 warnings, got '+JSON.stringify(r.warn));
if(!fs.existsSync(path.join(to,'pip.png'))||fs.existsSync(path.join(to,'fake.png')))bad('wrong files copied');
// the real drawings
const real=prepare(path.join(R,'art/sprites'),path.join(T,'real'));if(real.warn.length)bad('art/sprites: '+real.warn.join('; '));
const L=artList(G);if(L.unknown.length)bad('drawings the game does not use: '+L.unknown.join(', '));
for(const n of ['pip','elder','turnip','grubb','scout','tile-grass','tile-tree'])if(!L.rows.some(x=>x.name===n))bad('wanted list misses '+n);
fs.rmSync(T,{recursive:true,force:true});
console.log((fails?'FAIL':'ok')+' art: server step, '+real.count+' drawings in art/sprites, '+L.rows.length+' wanted');process.exitCode=fails?1:0;
