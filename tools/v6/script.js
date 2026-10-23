'use strict';
/* Reads the slice's script (docs/slice-dialogue.md) into scenes of lines, so the game speaks the document's words and they cannot
   drift (build step 12). A scene is a "### n.m" section (text under a "## n." heading before its first "###" is scene "n.0").
   Each item is a spoken line {who, text}, a sign or board {who, text} (italics removed), or a stage direction {dir}.
   "Pip" as a speaker or in a line is the hero: written as {hero} for the game to fill (systems.md §16). */
const fs=require('fs'),path=require('path');
const FILE=path.join(__dirname,'..','..','docs','slice-dialogue.md');
const clean=t=>t.replace(/\*\(([^)]*)\)\*/g,'($1)').replace(/\*\*/g,'').replace(/(^|[\s(])\*([^*]+)\*(?=[\s.,!?)]|$)/g,'$1$2').replace(/^\*|\*$/g,'').replace(/\s+/g,' ').trim();
const hero=t=>t.replace(/\bPip\b/g,'{hero}');
function readScript(){const src=fs.readFileSync(FILE,'utf8').split('\n'),S={};let part=null,cur=null;
  for(const raw of src){const line=raw.trim();
    const h2=line.match(/^## (\d+)\. (.*)/);if(h2){part=h2[1];cur=part==='4'||part==='5'||part==='7'||part==='8'||part==='0'?null:(S[part+'.0']={id:part+'.0',title:h2[2],items:[]});continue}
    const h3=line.match(/^### (\d+\.\d+) (.*)/);if(h3){cur=S[h3[1]]={id:h3[1],title:h3[2].replace(/\*/g,''),items:[]};continue}
    if(!cur||!line||line.startsWith('|')||line.startsWith('#'))continue;
    /* a spoken line: the last "**Name:**" or "**Name** (when)**:**" on the line */
    const m=[...line.matchAll(/\*\*([^*]+?)\*\*\s*(?:\*?\(([^)]*)\)\*?)?\*\*:\*\*\s*|\*\*([^*]+?):\*\*\s*/g)].pop();
    if(m){const who=(m[1]||m[3]).trim(),when=m[2]||null,text=line.slice(m.index+m[0].length),pre=clean(line.slice(0,m.index));
      if(pre&&!/^\*\*/.test(line))cur.items.push({dir:pre});
      cur.items.push(Object.assign({who:hero(who==='Pip'?'Pip':who),text:hero(clean(text))},when?{when}:{}));continue}
    if(/^\*.*\*$/.test(line)||/^\*[A-Z]/.test(line))cur.items.push({dir:hero(clean(line))})}
  for(const k of Object.keys(S))if(!S[k].items.length)delete S[k];
  return S}
module.exports={readScript,FILE};
if(require.main===module){const S=readScript();for(const s of Object.values(S)){console.log('##',s.id,s.title);s.items.slice(0,4).forEach(i=>console.log('  ',i.dir?'('+i.dir.slice(0,70)+')':i.who+': '+i.text.slice(0,70)+(i.when?' ['+i.when+']':'')))}}
