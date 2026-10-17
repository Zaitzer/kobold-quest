/* Dev tool: rewrite every module's import lines and its trailing `export {...}` from what it actually uses.
   Move a function to another file, run `node tools/imports.js`, done.
   Fails loudly on a name declared twice or on code assigning another module's variable. */
const fs=require('fs'),path=require('path'),acorn=require('acorn'),escope=require('eslint-scope');
const SRC=path.join(__dirname,'../src');
const files=[];(function scan(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())scan(p);else if(f.endsWith('.js'))files.push(p)}})(SRC);
const declNames=st=>{const out=[];const pat=p=>{if(!p)return;if(p.type==='Identifier')out.push(p.name);else if(p.type==='ObjectPattern')p.properties.forEach(q=>pat(q.value||q.argument));else if(p.type==='ArrayPattern')p.elements.forEach(pat);else if(p.type==='AssignmentPattern')pat(p.left);else if(p.type==='RestElement')pat(p.argument)};
  if(st.type==='ExportNamedDeclaration'&&st.declaration)st=st.declaration;
  if(st.type==='FunctionDeclaration'||st.type==='ClassDeclaration')out.push(st.id.name);else if(st.type==='VariableDeclaration')st.declarations.forEach(d=>pat(d.id));return out};
const mods={},owner={},errs=[];
for(const f of files.filter(f=>!/[\\/](main|systems)\.js$/.test(f))){const src=fs.readFileSync(f,'utf8').replace(/^export \{[^}]*\};?[ \t]*$/mg,'');
  // body = everything except import declarations and a plain `export {...};` list (both regenerated)
  const ast=acorn.parse(src,{ecmaVersion:2022,sourceType:'module'});let cut=[];const names=[],inline=new Set();
  for(const st of ast.body){if(st.type==='ImportDeclaration')cut.push([st.start,st.end]);
    else if(st.type==='ExportNamedDeclaration'&&!st.declaration&&!st.source)cut.push([st.start,st.end]);
    else{const n=declNames(st);n.forEach(x=>names.push(x));if(st.type==='ExportNamedDeclaration')n.forEach(x=>inline.add(x))}}
  let body=src;cut.sort((a,b)=>b[0]-a[0]).forEach(([s,e])=>{body=body.slice(0,s)+body.slice(e)});body=body.replace(/^\s*\n/,'').replace(/\n{3,}/g,'\n\n');
  mods[f]={body,names,inline};for(const n of names){if(owner[n])errs.push(n+' declared in '+path.relative(SRC,owner[n])+' and '+path.relative(SRC,f));owner[n]=f}}
const GLOBAL=new Set(Object.getOwnPropertyNames(globalThis).concat(['window','document','localStorage','sessionStorage','navigator','screen','innerWidth','innerHeight','requestAnimationFrame','matchMedia','claude','performance','getComputedStyle','devicePixelRatio','TEST','SITE','KQ_ART','BUILD_ID','location','WebSocket','alert','location','history','Image','AudioContext','ResizeObserver','MouseEvent','HTMLElement']));
for(const [f,m] of Object.entries(mods)){
  const ast=acorn.parse(m.body,{ecmaVersion:2022,sourceType:'module',ranges:true});const sm=escope.analyze(ast,{ecmaVersion:2022,sourceType:'module'});
  const seen=new Set(),use=new Map();
  for(const r of sm.globalScope.through.concat(...sm.globalScope.childScopes.map(s=>s.through))){if(seen.has(r.identifier))continue;seen.add(r.identifier);const n=r.identifier.name,o=owner[n];
    if(!o){if(!GLOBAL.has(n))errs.push('unknown '+n+' in '+path.relative(SRC,f));continue}if(o===f)continue;
    if(r.isWrite())errs.push(path.relative(SRC,f)+' assigns '+n+' (owned by '+path.relative(SRC,o)+'): use a setter or an object');
    if(!use.has(o))use.set(o,new Set());use.get(o).add(n)}
  m.use=use}
if(errs.length){console.error([...new Set(errs)].join('\n'));process.exit(1)}
for(const [f,m] of Object.entries(mods)){
  let h='';
  for(const [o,ns] of [...m.use].sort((a,b)=>a[0]<b[0]?-1:1)){let rel=path.relative(path.dirname(f),o);if(rel[0]!=='.')rel='./'+rel;h+='import {'+[...ns].sort().join(',')+"} from '"+rel+"';\n"}
  const ex=m.names.filter(n=>!m.inline.has(n));
  const lead=(m.body.match(/^\/\*[\s\S]*?\*\/\n/)||[''])[0];let out=lead+h+m.body.slice(lead.length).replace(/\s+$/,'')+(ex.length?'\nexport {'+[...new Set(ex)].sort().join(',')+'};':'')+'\n';
  if(out!==fs.readFileSync(f,'utf8'))fs.writeFileSync(f,out)}
console.log('imports ok:',files.length,'modules');
