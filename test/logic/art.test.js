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
// placeholders: every wanted drawing has a file; untouched template copies are skipped, a changed one counts
for(const x of L.rows)if(!fs.existsSync(path.join(R,'art/sprites',x.name+'.png')))bad('no placeholder for '+x.name);
for(const x of L.rows)if(!/^[a-z0-9][a-z0-9-]*$/.test(x.name))bad('bad file name '+x.name);
{const f2=path.join(T,'ph'),t2=path.join(T,'phout'),tp=path.join(T,'templates');fs.mkdirSync(f2);fs.mkdirSync(tp);
  fs.copyFileSync(path.join(R,'art/templates/character-128.png'),path.join(tp,'character-128.png'));
  fs.copyFileSync(path.join(R,'art/templates/character-128.png'),path.join(f2,'elder.png'));fs.copyFileSync(path.join(R,'test/fixtures/art/pip.png'),path.join(f2,'pip.png'));
  const p=prepare(f2,t2,tp);if(p.count!==1||p.blank!==1||p.warn.length)bad('placeholder handling: '+JSON.stringify(p))}
/* the v6 sheets beside art/sprites: a drawn one is copied under v6/ and listed; a stand-in (its hash in placeholders.json) is not */
{const root=path.join(T,'v6case'),sp=path.join(root,'sprites'),v6=path.join(root,'v6','characters','companions'),out=path.join(T,'v6out');fs.mkdirSync(sp,{recursive:true});fs.mkdirSync(v6,{recursive:true});
  const stand=fs.readFileSync(path.join(R,'art/v6/characters/companions/bork.png'));fs.writeFileSync(path.join(v6,'bork.png'),stand);
  fs.copyFileSync(path.join(R,'test/fixtures/art6/characters/companions/wizzle.png'),path.join(v6,'wizzle.png'));
  fs.writeFileSync(path.join(root,'v6','placeholders.json'),JSON.stringify({'characters/companions/bork.png':require('crypto').createHash('sha1').update(stand).digest('hex')}));
  const r=prepare(sp,out,path.join(R,'art/templates')),m=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
  if(!m['v6/characters/companions/wizzle']||m['v6/characters/companions/bork']||!fs.existsSync(path.join(out,'v6/characters/companions/wizzle.png')))bad('v6 sheets: '+JSON.stringify(Object.keys(m)))}
fs.rmSync(T,{recursive:true,force:true});
console.log((fails?'FAIL':'ok')+' art: server step, '+real.count+' drawings in art/sprites, '+L.rows.length+' wanted');process.exitCode=fails?1:0;
