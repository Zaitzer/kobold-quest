/* Dev tool: rename module-level names across src/ (and the tests that reach them as X.name or window handles), by scope, so a local
   variable that happens to share the name is never touched. Then run `node tools/imports.js` to rewrite the import lines.
     node tools/rename.js oldName=newName [old2=new2 ...]
     node tools/rename.js --into oldName=newName   the old name was a pass-through to the new one: delete it first, its callers move over
   A name must stay unique across src/ (tools/imports.js checks it); this tool refuses a new name that is already declared. */
const fs=require('fs'),path=require('path'),acorn=require('acorn'),escope=require('eslint-scope');
const R=path.join(__dirname,'..'),SRC=path.join(R,'src');
const into=process.argv.includes('--into'),map=Object.fromEntries(process.argv.slice(2).filter(a=>a!=='--into').map(a=>a.split('=')));
if(!Object.keys(map).length){console.log('usage: node tools/rename.js old=new ...');process.exit(1)}
const walk=d=>fs.readdirSync(d).flatMap(f=>{const p=path.join(d,f);return fs.statSync(p).isDirectory()?walk(p):f.endsWith('.js')?[p]:[]});
const files=walk(SRC);
/* refuse a clash with a name already declared at the top of any module */
const top=new Set();for(const f of files){const t=fs.readFileSync(f,'utf8');for(const m of t.matchAll(/^(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm))top.add(m[1])}
for(const [o,n] of Object.entries(map))if(!into&&top.has(n)&&!map[n]){console.error('refused: '+n+' is already declared');process.exit(1)}
let changed=0;
for(const f of files){if(/[\\/](main|systems)\.js$/.test(f))continue;const src=fs.readFileSync(f,'utf8').replace(/^export \{[^}]*\};?[ \t]*$/mg,'');let ast;   // the export list is rewritten by imports.js
  try{ast=acorn.parse(src,{ecmaVersion:2022,sourceType:'module',ranges:true})}catch(e){console.error(path.relative(R,f)+': '+e.message);process.exit(1)}
  const sm=escope.analyze(ast,{ecmaVersion:2022,sourceType:'module'}),edits=[];
  /* the module scope's variables with a name to change: their declaration and every reference that resolves to them */
  const mod=sm.scopes.find(s=>s.type==='module');
  for(const v of mod.variables)if(map[v.name]){for(const d of v.identifiers)edits.push(d.range);for(const r of v.references)edits.push(r.identifier.range)}
  /* names used here but declared elsewhere and not imported yet (the import lines are rewritten by imports.js): unresolved references */
  for(const s of sm.scopes)for(const r of s.through)if(map[r.identifier.name])edits.push(r.identifier.range);
  /* `export {a,b}` and import specifiers name the binding too */
  for(const st of ast.body){if((st.type==='ExportNamedDeclaration'&&!st.declaration)||st.type==='ImportDeclaration')for(const sp of st.specifiers){for(const k of ['local','exported','imported'])if(sp[k]&&map[sp[k].name])edits.push(sp[k].range)}}
  if(!edits.length)continue;
  const uniq=[...new Map(edits.map(e=>[e[0],e])).values()].sort((a,b)=>b[0]-a[0]);let out=src;
  for(const [s,e] of uniq){const old=out.slice(s,e);if(map[old])out=out.slice(0,s)+map[old]+out.slice(e)}
  /* the import lines go too: imports.js writes them again from what each module uses (a renamed import could clash with a local) */
  out=out.replace(/^import \{[^}]*\} from '[^']+';\n/mg,'');
  if(out!==fs.readFileSync(f,'utf8')){fs.writeFileSync(f,out);changed++}}
/* the tests reach exports as X.name or G.name (test/lib/game.js); window handles in the browser tests are left alone */
for(const f of walk(path.join(R,'test'))){const t=fs.readFileSync(f,'utf8');let o=t;for(const [a,b] of Object.entries(map))o=o.replace(new RegExp('\\b([XG])\\.'+a.replace(/\$/g,'\\$')+'\\b','g'),'$1.'+b);if(o!==t){fs.writeFileSync(f,o);changed++}}
console.log('renamed '+Object.keys(map).length+' names in '+changed+' files; now run node tools/imports.js');
