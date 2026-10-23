/* Copies Joakim's drawings from the repo (art/sprites/*.png) into the website's art folder and writes manifest.json
   (name → version and size), which the game reads at start. Run by deploy/install.sh on every update:
     node server/art.js <from> <to>
   Files that aren't small PNGs with plain names are skipped with a warning, never fatal. Placeholders (untouched copies of
   a template from art/templates, so there's a file ready to open for every drawing) are skipped quietly. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const MAX=2*1024*1024,NAME=/^[a-z0-9][a-z0-9-]{0,62}\.png$/;
/* sha1 of every template, so untouched placeholder copies can be told apart from real drawings */
function templateHashes(dir){const h=new Set();if(dir&&fs.existsSync(dir))for(const f of fs.readdirSync(dir))if(f.endsWith('.png'))h.add(crypto.createHash('sha1').update(fs.readFileSync(path.join(dir,f))).digest('hex'));return h}
const isPlaceholder=(b,tpl)=>tpl.has(crypto.createHash('sha1').update(b).digest('hex'));
function prepare(from,to,tplDir){const out={},warn=[],tpl=templateHashes(tplDir||path.join(from,'..','templates'));let blank=0;
  fs.rmSync(to,{recursive:true,force:true});fs.mkdirSync(to,{recursive:true});
  if(fs.existsSync(from))for(const f of fs.readdirSync(from).sort()){
    const p=path.join(from,f);if(!fs.statSync(p).isFile())continue;
    if(!NAME.test(f)){if(!/^\.|\.(pdn|md|txt)$/i.test(f))warn.push(f+': names are lower case letters, numbers and dashes, ending in .png');continue}
    const b=fs.readFileSync(p);if(isPlaceholder(b,tpl)){blank++;continue}
    if(b.length>MAX){warn.push(f+': bigger than 2 MB');continue}
    if(b.length<24||b.readUInt32BE(0)!==0x89504e47||b.toString('ascii',12,16)!=='IHDR'){warn.push(f+': not a PNG');continue}
    const w=b.readUInt32BE(16),h=b.readUInt32BE(20);if(w>1024||h>1024){warn.push(f+': larger than 1024 × 1024');continue}
    fs.writeFileSync(path.join(to,f),b);out[f.slice(0,-4)]={v:crypto.createHash('sha1').update(b).digest('hex').slice(0,8),w,h}}
  /* the v6 sprite sheets (art/v6, beside art/sprites): drawn ones only (not the stand-ins whose hashes are in placeholders.json) */
  const v6=path.join(from,'..','v6');if(fs.existsSync(v6))for(const [rel,b] of drawn6(v6)){
    if(b.length>MAX||b.length<24||b.readUInt32BE(0)!==0x89504e47){warn.push('v6/'+rel+': not a small PNG');continue}
    const w=b.readUInt32BE(16),h=b.readUInt32BE(20);if(w>1024||h>1024){warn.push('v6/'+rel+': larger than 1024 × 1024');continue}
    const dest=path.join(to,'v6',rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);out['v6/'+rel.slice(0,-4)]={v:crypto.createHash('sha1').update(b).digest('hex').slice(0,8),w,h}}
  fs.writeFileSync(path.join(to,'manifest.json'),JSON.stringify(out));
  return{count:Object.keys(out).length,warn,blank}}
/* every drawn sheet under art/v6: [relative path, bytes]; stand-ins (placeholders.json) and the templates are left out */
function drawn6(dir){let P={};try{P=JSON.parse(fs.readFileSync(path.join(dir,'placeholders.json'),'utf8'))}catch(e){}const out=[];
  (function walk(d){for(const f of fs.readdirSync(d).sort()){const p=path.join(d,f),rel=path.relative(dir,p).split(path.sep).join('/');
    if(fs.statSync(p).isDirectory()){if(f!=='templates')walk(p);continue}
    if(!/^[a-z0-9-]+(\/[a-z0-9-]+)*\.png$/.test(rel))continue;const b=fs.readFileSync(p);if(P[rel]===crypto.createHash('sha1').update(b).digest('hex'))continue;out.push([rel,b])}})(dir);
  return out}
if(require.main===module){const [from,to]=process.argv.slice(2);const r=prepare(from,to);r.warn.forEach(w=>console.log('art: skipped '+w));console.log('art: '+r.count+' drawings, '+r.blank+' placeholders still to draw')}
module.exports={prepare,templateHashes,isPlaceholder,drawn6};
