/* Rooms: every door leads into a room with a way out, rooms are closed in, and every villager, chest and quest
   spot in a room stands somewhere you can reach from the door. Walking in and out puts you back outside the door. */
const G=require('../lib/game.js')();let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
G.rp.s=G.rpNewState();G.rpApplyWorld();const world=G.rp.grid;
for(const [pos,id] of Object.entries(G.RP_DOORS)){const [x,y]=pos.split(',').map(Number);
  if(world[y][x]!=='d')bad('door '+pos+' is not a door tile');if(!G.RP_PLACES[id])bad('door '+pos+' leads to unknown room '+id)}
for(const [id,P] of Object.entries(G.RP_PLACES)){
  const W=P.rows[0].length,H=P.rows.length;P.rows.forEach((r,y)=>{if(r.length!==W)bad(id+' row '+y+' is '+r.length+' wide, not '+W)});
  if(!Object.values(G.RP_DOORS).includes(id))bad(id+' has no door');
  const exits=[];P.rows.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='e')exits.push([x,y]);if((x===0||y===0||x===W-1||y===H-1)&&c!=='w'&&c!=='e')bad(id+' has a hole at '+x+','+y)}));
  if(exits.length!==1)bad(id+' needs exactly one way out (e), has '+exits.length);
  G.rpEnterPlace(id);const s=G.rp.s;if(s.place!==id)bad('could not enter '+id);
  // flood from the arrival tile
  const seen=new Set([s.x+','+s.y]),q=[[s.x,s.y]];while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(seen.has(k))continue;const c=G.rp.grid[ny]&&G.rp.grid[ny][nx];if(!c||G.RP_SOLID.has(c))continue;seen.add(k);q.push([nx,ny])}}
  const reach=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1],[0,0]].some(([dx,dy])=>seen.has((x+dx)+','+(y+dy)));
  for(const n of G.RP_NPC.filter(n=>n.place===id)){if(G.RP_SOLID.has(G.rp.grid[n.y][n.x]))bad(n.id+' stands inside furniture in '+id);if(!reach(n.x,n.y))bad(n.id+' cannot be reached in '+id)}
  for(const c of G.RP_CHESTS.filter(c=>c.place===id))if(!reach(c.x,c.y))bad('chest at '+c.x+','+c.y+' in '+id+' cannot be reached');
  for(const sp of G.RP_SPOTS.filter(c=>c.place===id))if(!seen.has(sp.x+','+sp.y))bad('spot '+sp.id+' in '+id+' cannot be walked onto');
  // step on the way out → back outside, one step south of the door
  const [ex,ey]=exits[0];G.rpEnterTile(ex,ey);const door=Object.keys(G.RP_DOORS).find(k=>G.RP_DOORS[k]===id).split(',').map(Number);
  if(s.place||Math.abs(s.x-door[0])>1||s.y<=door[1]||s.y>door[1]+2)bad('leaving '+id+' put Pip at '+(s.place||'world')+' '+s.x+','+s.y);
  if(G.rpSolid(s.x,s.y))bad('outside '+id+' Pip stands in something solid')}
// the needles quest works end to end
G.rp.s=G.rpNewState();G.rpApplyWorld();const s=G.rp.s;G.rpEnterPlace('elder');G.rpTalk('nettle');G.rpDlgNext();G.rpDlgNext();G.rpChoose(0);
if(s.q.needles!==1)bad('Granny Nettle did not give the quest');
G.rpLeavePlace();G.rpEnterPlace('hut');const sp=G.RP_SPOTS.find(x=>x.id==='needles');G.rpEnterTile(sp.x,sp.y);if(s.q.needles!==2)bad('needles not found in the hut');
G.rpLeavePlace();G.rpEnterPlace('elder');G.rpTalk('nettle');while(G.rp.mode==='dialog')G.rpDlgNext();
if(s.q.needles!==3||!s.inv.includes('cl_scarf'))bad('needles quest reward missing');
// chests in rooms remember themselves per room
G.rpEnterPlace('hut');const ch=G.RP_CHESTS.find(c=>c.place==='hut');G.rpOpenChest(ch);if(G.rpChestAt(ch.x,ch.y))bad('hut chest opens twice');
G.rpLeavePlace();if(G.rpChestAt(ch.x,ch.y))bad('hut chest shows up outdoors');
console.log(fails?'FAIL':'ok','rooms:',Object.keys(G.RP_PLACES).length,'rooms checked,',fails,'problems');process.exitCode=fails?1:0;
// every door can be reached from outside: some tile next to it is free
{G.rp.s=G.rpNewState();G.rpApplyWorld();let n=0;for(const pos of Object.keys(G.RP_DOORS)){const [x,y]=pos.split(',').map(Number);
  if(![[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>!G.rpSolid(x+dx,y+dy))){n++;console.log('FAIL door '+pos+' is blocked on every side')}}process.exitCode=n||process.exitCode}
