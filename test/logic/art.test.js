/* Sprite sheets: the server's art step copies every sheet the game draws (characters, foes, bosses, tiles), the stand-ins too, and lists
   them; it leaves out the other folders and skips bad files with a reason; every sheet in art/ is a valid PNG. */
const fs=require('fs'),path=require('path'),os=require('os');let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const {prepare}=require('../../server/art.js');
const R=path.join(__dirname,'../..'),T=fs.mkdtempSync(path.join(os.tmpdir(),'kqart-'));
{const root=path.join(T,'art'),dir=path.join(root,'characters','companions'),out=path.join(T,'out');fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(path.join(root,'portraits'),{recursive:true});
  fs.copyFileSync(path.join(R,'art/characters/companions/bork.png'),path.join(dir,'bork.png'));   // a stand-in
  fs.copyFileSync(path.join(R,'test/fixtures/art/characters/companions/wizzle.png'),path.join(dir,'wizzle.png'));
  fs.copyFileSync(path.join(R,'art/portraits/mallow.png'),path.join(root,'portraits','mallow.png'));
  fs.writeFileSync(path.join(dir,'fake.png'),'not a png');fs.copyFileSync(path.join(R,'test/fixtures/art/characters/companions/wizzle.png'),path.join(dir,'Bad Name.png'));
  const r=prepare(root,out),m=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
  if(!m['characters/companions/wizzle']||!m['characters/companions/bork']||!fs.existsSync(path.join(out,'characters/companions/wizzle.png')))bad('sheets, stand-ins too: '+JSON.stringify(Object.keys(m)));
  if(m['portraits/mallow'])bad('faces are not sheets the game draws yet');
  if(r.warn.length!==1||!/fake/.test(r.warn[0]))bad('warnings: '+JSON.stringify(r.warn))}
/* the real folder: nothing bad in it, and the slice's sheets are there */
{const r=prepare(path.join(R,'art'),path.join(T,'real'));if(r.warn.length)bad('art/: '+r.warn.join('; '));if(r.count<150)bad('only '+r.count+' sheets')}
fs.rmSync(T,{recursive:true,force:true});
console.log((fails?'FAIL':'ok')+' art: the server step for art/');process.exitCode=fails?1:0;
