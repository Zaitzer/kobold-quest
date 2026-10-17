/* Copies Joakim's drawings from the repo (art/sprites/*.png) into the website's art folder and writes manifest.json
   (name → version and size), which the game reads at start. Run by deploy/install.sh on every update:
     node server/art.js <from> <to>
   Files that aren't small PNGs with plain names are skipped with a warning, never fatal. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const MAX=2*1024*1024,NAME=/^[a-z0-9][a-z0-9-]{0,62}\.png$/;
function prepare(from,to){const out={},warn=[];
  fs.rmSync(to,{recursive:true,force:true});fs.mkdirSync(to,{recursive:true});
  if(fs.existsSync(from))for(const f of fs.readdirSync(from).sort()){
    const p=path.join(from,f);if(!fs.statSync(p).isFile())continue;
    if(!NAME.test(f)){if(!/^\.|\.(pdn|md|txt)$/i.test(f))warn.push(f+': names are lower case letters, numbers and dashes, ending in .png');continue}
    const b=fs.readFileSync(p);
    if(b.length>MAX){warn.push(f+': bigger than 2 MB');continue}
    if(b.length<24||b.readUInt32BE(0)!==0x89504e47||b.toString('ascii',12,16)!=='IHDR'){warn.push(f+': not a PNG');continue}
    const w=b.readUInt32BE(16),h=b.readUInt32BE(20);if(w>1024||h>1024){warn.push(f+': larger than 1024 × 1024');continue}
    fs.writeFileSync(path.join(to,f),b);out[f.slice(0,-4)]={v:crypto.createHash('sha1').update(b).digest('hex').slice(0,8),w,h}}
  fs.writeFileSync(path.join(to,'manifest.json'),JSON.stringify(out));
  return{count:Object.keys(out).length,warn}}
if(require.main===module){const [from,to]=process.argv.slice(2);const r=prepare(from,to);r.warn.forEach(w=>console.log('art: skipped '+w));console.log('art: '+r.count+' drawings')}
module.exports={prepare};
