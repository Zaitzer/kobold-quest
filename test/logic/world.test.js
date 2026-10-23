/* The world's data (world/, made in the map editor; tools/world/world.js): every file is in the one format the editor writes, the world
   has no problems, and the checks catch what would break the game: a link with no way back, a mark that cannot be reached, a missed goal,
   a person in a wall's place off the map, a scene's line that is not in the script, a letter that is not a tile. */
const fs=require('fs'),path=require('path'),R=path.join(__dirname,'../..'),KW=require(R+'/tools/world/world.js');
let fails=0,n=0;const ok=(c,m)=>{n++;if(!c){fails++;console.log('FAIL',m)}};
const W=KW.load(R),script=KW.parseScript(fs.readFileSync(R+'/docs/slice-dialogue.md','utf8'));
/* the format: what is on disk is exactly what the editor would write */
ok(fs.readFileSync(R+'/world/tiles.json','utf8')===KW.format(W.tiles)+'\n','world/tiles.json is in the editor\'s format');
ok(fs.readFileSync(R+'/world/scenes.json','utf8')===KW.format(W.scenes)+'\n','world/scenes.json is in the editor\'s format');
for(const P of Object.values(W.places))ok(fs.readFileSync(R+'/world/'+KW.fileOf(P),'utf8')===KW.format(KW.placeFile(P))+'\n','world/'+KW.fileOf(P)+' is in the editor\'s format');
/* the world as it is */
const r=KW.check(W,{script});ok(!r.problems.length,'the world has no problems: '+JSON.stringify(r.problems).slice(0,300));
ok(r.report.length>=5,'the maps\' goals are measured: '+r.report.length);
/* the checks catch breakage */
const broke=(fn,re,what)=>{const B=JSON.parse(JSON.stringify(W));fn(B);const p=KW.check(B,{script}).problems.map(p=>p.where+': '+p.msg).join(' | ');ok(re.test(p),what+' → '+(p||'no problem found'))};
broke(B=>{B.places.r1.links.find(l=>l.to==='pebblebrook').to='mine1'},/no way back/,'a link with no way back');
broke(B=>{const P=B.places.pebblebrook,[x,y]=P.marks[0];P.rows[y]=P.rows[y].slice(0,x)+'B'+P.rows[y].slice(x+1);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const r=P.rows[y+dy];if(r&&r[x+dx]!=null)P.rows[y+dy]=r.slice(0,x+dx)+'B'+r.slice(x+dx+1)}},/cannot be reached/,'a mark walled in');
broke(B=>{B.places.mine1.goals[0].max=10},/stairs to stairs: \d+ steps, the goal/,'a missed goal');
broke(B=>{B.places.hearthspire.npcs[0].x=99},/off the map/,'a person off the map');
broke(B=>{B.scenes.scenes.find(s=>s.id==='1.2').steps[0][2]='no such words anywhere'},/scene 1.2: the line/,'a line that is not in the script');
broke(B=>{B.places['room:inn'].rows[1]='wHqqqsss!qqow'},/"!" is not a room tile/,'a letter that is not a tile');
broke(B=>{B.scenes.scenes.find(s=>s.id==='1.3').at.npc='nobody'},/nobody called "nobody"/,'a scene for someone who is not there');
broke(B=>{B.scenes.scenes.find(s=>s.id==='1.2').steps.find(s=>s[0]==='fight')[1]='nope'},/no set piece "nope"/,'a fight that does not exist');
/* the game's data keeps its shape */
const G=KW.toGame(W,script);
ok(G.MAPS6.r1&&G.MAPS6.r1.enc&&G.MAPS6.r1.theme==='meadow'&&G.ROOMS6.inn&&G.ROOMS6.inn.solid.includes('w'),'maps and rooms for the game, with encounters and solids');
ok(G.LINKS6.every(l=>l.length>=7)&&G.LINKS6.some(l=>l[0]==='room:bakery'&&l[3]==='room:cellar'),'links as the game reads them');
ok(G.SCENES6.find(s=>s.id==='1.2').steps[0].length===5,'say steps carry their line numbers');
ok(G.NPCS6.every(n=>n.place&&W.places[n.place]),'every person knows their place');
console.log(fails?fails+' of '+n+' world checks FAILED':'world: '+n+' checks');process.exitCode=fails?1:0;
