/* Loads the last pre-rebuild version (v37) headless, for parity tests: new rules must behave like the old code. */
const fs=require('fs'),path=require('path');
module.exports=function(){
  const html=fs.readFileSync(path.join(__dirname,'../fixtures/v37.html'),'utf8');
  let code=html.match(/<script>([\s\S]*)<\/script>/)[1];
  const a=code.indexOf('/* ---------- Kobold Quest'),names=[...new Set([...code.slice(a>0?a:0).matchAll(/^(?:function|const|let) (rp\w*|RP_\w+|net\w*|tc\w+)\b/mg)].map(m=>m[1]))];
  const end='requestAnimationFrame(frame);\n})();';const i=code.lastIndexOf(end);
  code=code.slice(0,i)+'globalThis.__old={WEAPONS,TEAMS,'+names.join(',')+'};\n})();'+code.slice(i+end.length);
  require('./game.js');// installs nothing by itself; stubs come from load()
  const prev={document:global.document,window:global.window,localStorage:global.localStorage};
  (0,eval)(code);const o=globalThis.__old;o.rp.headless=true;return o;
};
