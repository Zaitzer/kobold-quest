/* Copies Joakim's sprite sheets from the repo (art/) into the website's art folder and writes manifest.json (name → version and
   size), which the game reads at start. Run by deploy/install.sh on every update:  node server/art.js <art> <to>
   Every sheet the game draws is copied, the stand-ins too (tools/placeholder-art.py; they show until Joakim draws over them): the
   folders the game finds sheets in by name (characters, foes, bosses, tiles). Templates, faces, icons and effects are left out until the
   game uses them. Files that aren't small PNGs with plain names are skipped with a warning, never fatal. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const MAX=2*1024*1024,FOLDERS=['characters','foes','bosses','tiles'];
/* every sheet the game uses under the art folder: [relative path without .png, bytes] */
function sheets(dir){const out=[];
  const walk=d=>{if(!fs.existsSync(d))return;for(const n of fs.readdirSync(d).sort()){const p=path.join(d,n),rel=path.relative(dir,p).split(path.sep).join('/');
    if(fs.statSync(p).isDirectory()){walk(p);continue}if(/^[a-z0-9-]+(\/[a-z0-9-]+)*\.png$/.test(rel))out.push([rel.slice(0,-4),fs.readFileSync(p)])}};
  for(const f of FOLDERS)walk(path.join(dir,f));
  return out}
function prepare(from,to){const out={},warn=[];fs.rmSync(to,{recursive:true,force:true});fs.mkdirSync(to,{recursive:true});
  for(const [key,b] of sheets(from)){
    if(b.length>MAX||b.length<24||b.readUInt32BE(0)!==0x89504e47||b.toString('ascii',12,16)!=='IHDR'){warn.push(key+'.png: not a small PNG');continue}
    const w=b.readUInt32BE(16),h=b.readUInt32BE(20);if(w>1024||h>1024){warn.push(key+'.png: larger than 1024 × 1024');continue}
    const dest=path.join(to,key+'.png');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);out[key]={v:crypto.createHash('sha1').update(b).digest('hex').slice(0,8),w,h}}
  fs.writeFileSync(path.join(to,'manifest.json'),JSON.stringify(out));return{count:Object.keys(out).length,warn}}
if(require.main===module){const [from,to]=process.argv.slice(2);const r=prepare(from,to);r.warn.forEach(w=>console.log('art: skipped '+w));console.log('art: '+r.count+' sheets')}
module.exports={prepare,sheets,FOLDERS};
