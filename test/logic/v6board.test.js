/* v6 boards (build step 9, systems.md §2): 500 generated boards per theme, counted against the board goals. */
process.emitWarning=()=>{};
let fails=0,checks=0;const bad=m=>{fails++;console.log('FAIL',m)};
const X=require('../lib/game.js')();X.rp.headless=true;
const N=500,out=[];
function reach4(g,W,H){const seen=new Set([(H-1)*W+(W>>1)]),q=[[W>>1,H-1]];
  while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=ny*W+nx;if(nx<0||ny<0||nx>=W||ny>=H||seen.has(k)||X.tcT(g[ny][nx]).solid)continue;seen.add(k);q.push([nx,ny])}}return seen}
for(const th of Object.keys(X.V6_THEMES)){let unreach=0,bossBad=0,startBad=0,water=0,tiles=0,foeDeep=0,nf=0,sight=0;
  for(let i=0;i<N;i++){const boss=i%5===0,W=boss?12:[9,10,11][i%3],H=boss?14:[12,13,14][i%3];
    const g=X.v6Gen(th,W,H,boss?'b':null,i*7919+13),R=reach4(g,W,H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){tiles++;const t=X.tcT(g[y][x]);if(g[y][x]==='~')water++;if(!t.solid&&!R.has(y*W+x))unreach++;
      if(y>=H-3&&((t.solid&&t.cov===2)||g[y][x]==='~'))startBad++}
    if(boss&&X.v6BossRoom(g,W,H,X.tcBase(X.V6_THEMES[th].base))!==0)bossBad++}
  // foe starts and sight, through the battle's own set-up
  for(let i=0;i<100;i++){X.rp.s=X.rpNewState();X.rpApplyWorld();const members=['fighter','cleric','wizard','rogue'].map((c,j)=>({m:X.v6Kobold('K'+j,c,4),ctl:'me',own:'h'}));
    X.rp.mode='map';X.rpBattle(X.v6Mix(X.PLACES6[0]),{members,zone:',',v6:1,theme:th});const b=X.rp.bt;
    b.units.filter(u=>u.side===1).forEach(u=>{nf++;if(u.y>b.H*0.42+3)foeDeep++});sight+=X.tcSight(b,b.units[0])}
  const wp=water/tiles;out.push(th+' water '+(wp*100).toFixed(0)+'%');
  checks++;if(unreach)bad(th+': '+unreach+' open tiles cannot be reached');
  checks++;if(bossBad)bad(th+': '+bossBad+' boss boards where the boss cannot reach every tile');
  checks++;if(startBad)bad(th+': '+startBad+' full-cover or water tiles in the starting rows');
  checks++;if(foeDeep)bad(th+': '+foeDeep+'/'+nf+' foes start outside the far part of the board');
  checks++;if(sight/100!==(th==='dark'?3:/cave|flooded/.test(X.V6_THEMES[th].base==='cave'?'cave':'')?5:7))bad(th+': sight '+sight/100);
  if(th==='flooded'){checks++;if(wp<0.2||wp>0.35)bad('flooded boards should be about a quarter water: '+(wp*100).toFixed(0)+'%')}}
console.log(fails?fails+' failures':'v6 boards: '+checks+' checks over '+N+' boards per theme ('+out.join(', ')+')');process.exitCode=fails?1:0;
