/* v6 data (build step 1): the generated files in src/data/v6 are up to date with the design's tools, and samples agree with the
   documents (balance.md's class table, skills.md's prices, the bestiary's rule, items.md's tables, the slice's maps). */
process.emitWarning=()=>{};   // the generated files are ES modules in a CommonJS repo: Node warns once, harmlessly
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const R=path.join(__dirname,'../..'),D=path.join(R,'src/data/v6');
const before=fs.readdirSync(D).map(f=>[f,fs.readFileSync(path.join(D,f),'utf8')]);
execFileSync('node',[path.join(R,'tools/gen-data.js')],{stdio:'pipe'});
for(const [f,t] of before)if(fs.readFileSync(path.join(D,f),'utf8')!==t)bad(f+' was out of date with the design (run node tools/gen-data.js and commit)');
(async()=>{
  const C=await import(path.join(D,'classes.js')),S=await import(path.join(D,'skills.js')),F=await import(path.join(D,'foes.js')),
        I=await import(path.join(D,'items.js')),Mp=await import(path.join(D,'maps.js'));
  // classes against balance.md's table (HP, attack, defence columns)
  const bal=fs.readFileSync(path.join(R,'docs/balance.md'),'utf8');
  for(const [id,c] of Object.entries(C.CLASSES6)){const row=bal.split('\n').find(l=>l.startsWith('| '+c.n+' | .'));if(!row){bad('no balance row for '+c.n);continue}
    const cells=row.split('|').map(x=>x.trim());const num=s=>+s.replace('×','');
    const mag=C.FAMILIES[c.fam].magic,atkCol=mag?c.spa:c.atk;   // for casters the class table's attack column is their spell power (special attack)
    if(num(cells[5])!==c.hp||num(cells[6])!==atkCol||num(cells[7])!==c.def)bad(c.n+': class table '+cells.slice(5,8).join(' ')+' vs data '+[c.hp,atkCol,c.def].join(' '))}
  // skills: every class has a kit, every mana cost is within the bounds, every skill has a dark twin
  const SK=Object.values(S.SKILLS6);if(SK.length!==109)bad('skills: '+SK.length+' not 109');
  for(const s of SK){if(!(s.mp>=2&&s.mp<=8)&&s.n!=='Adapt')bad('mana out of bounds: '+s.n+' '+s.mp);if(!s.dark)bad('no dark twin: '+s.n);if(!s.t)bad('no target: '+s.n)}
  for(const c of Object.keys(C.CLASSES6))if(!S.KITS6[c]||!S.KITS6[c].start.length)bad('no starting skill for '+c);
  const pb=S.SKILLS6.fighter_power_bonk;if(!pb||pb.mp!==3||pb.mul!==1.8)bad('Power bonk should cost 3 and hit ×1.8 (skills.md)');
  // foes: a normal foe at its level is the level foe
  const M=require(path.join(R,'tools/balance-model.js'));const g=F.FOES6.guard_recruit||Object.values(F.FOES6).find(f=>f.role==='normal');
  const L=g.lv[0];if(Math.abs(g.by[L].hp-Math.round(M.foe(L).hp))>1)bad('a normal foe\'s HP should be the level foe\'s ('+g.by[L].hp+' vs '+M.foe(L).hp.toFixed(0)+')');
  for(const p of F.PLACES6)for(const id of p.pool)if(!F.FOES6[id])bad('place '+p.place+' names '+id);
  // items: names and prices from items.md
  if(I.GEAR6.armour.plain[1].n!=='Padded jacket')bad('T2 armour should be the Padded jacket');
  if(I.PRICES6[2].weapon!==108)bad('T2 weapon price should be 108');
  if(!I.RECIPES6.some(r=>/miller's boots/i.test(r.n)))bad('the miller\'s boots recipe is missing');
  if(I.WEAPONS6.guns[0].n!=='Popgun')bad('the T1 gun should be the Popgun');
  // maps: the slice's places exist
  for(const k of ['hearthspire','r1','pebblebrook','mine1','mine2','mine3'])if(!Mp.MAPS6[k])bad('no map '+k);
  if(!Mp.ROOMS6.bakery||!Mp.ROOMS6.mill)bad('rooms missing');
  {const r=require('child_process').spawnSync('node',['tools/doc-tables.js','check'],{cwd:require('path').join(__dirname,'../..'),encoding:'utf8'});if(r.status)bad('the documents\' tables differ from their tools (run node tools/doc-tables.js): '+r.stdout.trim())}
  console.log(fails?fails+' failures':'v6 data: up to date and agrees with the design ('+SK.length+' skills, '+Object.keys(F.FOES6).length+' foes)');process.exitCode=fails?1:0})();
