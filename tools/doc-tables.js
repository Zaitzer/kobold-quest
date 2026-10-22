/* Regenerate the tables the documents print from the design tools, so the documents and the tools cannot drift.
   `node tools/doc-tables.js` replaces each markdown table in a document whose header line equals a printed table's header line.
   `node tools/doc-tables.js check` only reports tables that differ (used by test/logic/v6data.test.js). */
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const R=path.join(__dirname,'..'),run=(...a)=>execFileSync('node',a,{cwd:R,encoding:'utf8'});
const JOBS=[{doc:'docs/balance.md',out:()=>run('tools/balance-model.js','levels')},
  {doc:'docs/bestiary.md',out:()=>run('tools/content-tables.js','foes')},
  {doc:'docs/balance.md',out:()=>run('tools/gen-data.js','bosstable')}];
const cells=l=>l.split('|').slice(1,-1).map(c=>c.trim());
function tables(text){const L=text.split('\n'),out=[];for(let i=0;i<L.length;i++){if(!L[i].startsWith('|')||(i&&L[i-1].startsWith('|')))continue;let j=i;while(j<L.length&&L[j].startsWith('|'))j++;out.push({head:L[i],at:i,len:j-i,rows:L.slice(i,j)});i=j}return out}
const check=process.argv[2]==='check';let changed=[];
for(const J of JOBS){const file=path.join(R,J.doc);let text=fs.readFileSync(file,'utf8');
  for(const T of tables(J.out())){const L=text.split('\n');let D=tables(text).find(d=>d.head===T.head),rows=T.rows;
    if(!D){/* a document table with more columns (the same first column): the printed columns are merged in, by row key and column name */
      const th=cells(T.head),cand=tables(text).find(d=>{const dh=cells(d.head);return dh[0]===th[0]&&th.filter(c=>dh.includes(c)).length>=3});
      if(!cand){changed.push(J.doc+': no table with header '+T.head.slice(0,60));continue}D=cand;const dh=cells(D.head),key=new Map(T.rows.slice(2).map(r=>[cells(r)[0],cells(r)]));
      rows=D.rows.map((r,i)=>{if(i<2)return r;const c=cells(r),t=key.get(c[0]);if(!t)return r;th.forEach((h,j)=>{const k=dh.indexOf(h.replace(/ \(×g\)$/,''));if(k>0&&j>0)c[k]=t[j]});return'| '+c.join(' | ')+' |'})}
    if(D.rows.join('\n')===rows.join('\n'))continue;changed.push(J.doc+': '+T.head.slice(0,50));L.splice(D.at,D.len,...rows);text=L.join('\n')}
  if(!check)fs.writeFileSync(file,text)}
console.log(changed.length?(check?'differ:\n':'updated:\n')+changed.join('\n'):'tables up to date');if(check&&changed.length)process.exitCode=1;
