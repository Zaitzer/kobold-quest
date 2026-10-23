/* Sprite sheets: the server's art step copies the drawn sheets under v6/ and lists them, skips the stand-ins (their hashes in
   placeholders.json) and bad files with a reason; every file in art/v6 is a valid PNG or a stand-in. */
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto');let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const {prepare}=require('../../server/art.js');
const R=path.join(__dirname,'../..'),T=fs.mkdtempSync(path.join(os.tmpdir(),'kqart-'));
{const root=path.join(T,'v6'),dir=path.join(root,'characters','companions'),out=path.join(T,'out');fs.mkdirSync(dir,{recursive:true});
  const stand=fs.readFileSync(path.join(R,'art/v6/characters/companions/bork.png'));fs.writeFileSync(path.join(dir,'bork.png'),stand);
  fs.copyFileSync(path.join(R,'test/fixtures/art6/characters/companions/wizzle.png'),path.join(dir,'wizzle.png'));
  fs.writeFileSync(path.join(dir,'fake.png'),'not a png');fs.copyFileSync(path.join(R,'test/fixtures/art6/characters/companions/wizzle.png'),path.join(dir,'Bad Name.png'));
  fs.writeFileSync(path.join(root,'placeholders.json'),JSON.stringify({'characters/companions/bork.png':crypto.createHash('sha1').update(stand).digest('hex')}));
  const r=prepare(root,out),m=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
  if(!m['v6/characters/companions/wizzle']||m['v6/characters/companions/bork']||!fs.existsSync(path.join(out,'v6/characters/companions/wizzle.png')))bad('drawn sheets: '+JSON.stringify(Object.keys(m)));
  if(r.warn.length!==1||!/fake/.test(r.warn[0]))bad('warnings: '+JSON.stringify(r.warn))}
/* the real folder: nothing bad in it */
{const r=prepare(path.join(R,'art/v6'),path.join(T,'real'));if(r.warn.length)bad('art/v6: '+r.warn.join('; '))}
fs.rmSync(T,{recursive:true,force:true});
console.log((fails?'FAIL':'ok')+' art: the server step for art/v6');process.exitCode=fails?1:0;
