/* Copies Joakim's sprite sheets from the repo (art/v6) into the website's art folder and writes manifest.json (name → version and
   size), which the game reads at start. Run by deploy/install.sh on every update:  node server/art.js <art/v6> <to>
   Only drawn sheets are copied: the stand-ins (their hashes are in art/v6/placeholders.json) and the templates are left out. Files
   that aren't small PNGs with plain names are skipped with a warning, never fatal. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const MAX=2*1024*1024;
/* every drawn sheet under art/v6: [relative path, bytes] */
function drawn6(dir){let P={};try{P=JSON.parse(fs.readFileSync(path.join(dir,'placeholders.json'),'utf8'))}catch(e){}const out=[];
  (function walk(d){for(const f of fs.readdirSync(d).sort()){const p=path.join(d,f),rel=path.relative(dir,p).split(path.sep).join('/');
    if(fs.statSync(p).isDirectory()){if(f!=='templates')walk(p);continue}
    if(!/^[a-z0-9-]+(\/[a-z0-9-]+)*\.png$/.test(rel))continue;const b=fs.readFileSync(p);if(P[rel]===crypto.createHash('sha1').update(b).digest('hex'))continue;out.push([rel,b])}})(dir);
  return out}
function prepare(from,to){const out={},warn=[];fs.rmSync(to,{recursive:true,force:true});fs.mkdirSync(to,{recursive:true});
  if(fs.existsSync(from))for(const [rel,b] of drawn6(from)){
    if(b.length>MAX||b.length<24||b.readUInt32BE(0)!==0x89504e47||b.toString('ascii',12,16)!=='IHDR'){warn.push(rel+': not a small PNG');continue}
    const w=b.readUInt32BE(16),h=b.readUInt32BE(20);if(w>1024||h>1024){warn.push(rel+': larger than 1024 × 1024');continue}
    const dest=path.join(to,'v6',rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);out['v6/'+rel.slice(0,-4)]={v:crypto.createHash('sha1').update(b).digest('hex').slice(0,8),w,h}}
  fs.writeFileSync(path.join(to,'manifest.json'),JSON.stringify(out));return{count:Object.keys(out).length,warn}}
if(require.main===module){const [from,to]=process.argv.slice(2);const r=prepare(from,to);r.warn.forEach(w=>console.log('art: skipped '+w));console.log('art: '+r.count+' sheets drawn')}
module.exports={prepare,drawn6};
