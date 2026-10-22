#!/usr/bin/env node
'use strict';
/* Counts the spoken lines in a dialogue script (docs/slice-dialogue.md): lines starting with **Name:** (or **Name** (...)**:**),
   per "## " part, and flags any box longer than 90 characters. Writes the table into the file in place of LINECOUNT, or
   replaces the table after "## 8. Line count". Usage: node tools/linecount.js docs/slice-dialogue.md                     */
const fs=require('fs');const file=process.argv[2]||'docs/slice-dialogue.md';let src=fs.readFileSync(file,'utf8');
/* the kit's budget is per town stretch (town-kit.md, item 19: 150–250 lines): Pebblebrook's stretch is R1, the town and the
   chats at its inn; Hearthspire's act 1 has no kit budget (it is the story itself), so it is only counted */
const STRETCH={'1':'hearthspire','2':'pebblebrook','3':'pebblebrook','6.1':'hearthspire','6.2':'hearthspire','6.3':'pebblebrook','6.4':'pebblebrook','6.5':'pebblebrook'};
const BUDGET={pebblebrook:[150,250]};
const parts={},stretch={};let part=null,sub=null,long=[];
for(const line of src.split('\n')){const h=line.match(/^## (\d+)\. (.*)/);if(h){part=h[1];sub=null;parts[part]={name:h[2],n:0};continue}
  const h3=line.match(/^### (\d+\.\d+) /);if(h3)sub=h3[1];
  if(!part||part==='8'||!/^\*\*[^*]+:\*\*/.test(line))continue;
  const text=line.replace(/^\*\*.*?:\*\*\s*/,'').replace(/\*\([^)]*\)\*\s*/g,'');parts[part].n++;
  const st=STRETCH[sub]||STRETCH[part];if(st)stretch[st]=(stretch[st]||0)+1;
  if(text.replace(/[*_]/g,'').length>90)long.push(`§${part}: ${text.slice(0,50)}… (${text.length})`)}
let rows='| part | lines |\n|---|---|\n',tot=0;
for(const [k,p] of Object.entries(parts)){if(!p.n)continue;tot+=p.n;rows+=`| ${k}. ${p.name} | ${p.n} |\n`}
rows+=`| **all** | **${tot}** |\n\n| stretch | lines | the kit's budget |\n|---|---|---|\n`;
for(const [k,n] of Object.entries(stretch)){const b=BUDGET[k];rows+=`| ${k} | ${n} | ${b?b[0]+'–'+b[1]+(n<b[0]||n>b[1]?' **out**':' (in)'):'none (act 1 is the story itself)'} |\n`}
rows+='\n'+(long.length?'**Too long for one box:** '+long.join('; ')+'\n':'Every line fits one box (90 characters).\n');
if(src.includes('LINECOUNT'))src=src.replace('LINECOUNT',rows);else src=src.replace(/(## 8\. Line count[\s\S]*?\n\n\*Counted[^\n]*\n\n)[\s\S]*$/,'$1'+rows);
fs.writeFileSync(file,src);console.log(rows);
