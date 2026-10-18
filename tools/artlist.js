/* Writes art/WANTED.md: every drawing the game can use, its file name, its template, and whether it exists yet.
   Run by tools/build.js, so the list always matches the game. */
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..');
const {templateHashes,isPlaceholder}=require('../server/art.js');
function artList(G){
  const TPL=templateHashes(R+'/art/templates'),files=fs.existsSync(R+'/art/sprites')?fs.readdirSync(R+'/art/sprites').filter(f=>f.endsWith('.png')):[];
  const have=new Set(files.filter(f=>!isPlaceholder(fs.readFileSync(R+'/art/sprites/'+f),TPL)).map(f=>f.slice(0,-4)));
  const rows=[],seen=new Set(),add=(group,name,who,tpl)=>{if(seen.has(name))return;seen.add(name);rows.push({group,name,who,tpl})};
  add('Heroes','pip','Pip','character-128');
  for(const n of G.RP_NPC)add(n.place?'Villagers (indoors)':'Villagers',G.artName(n.art||n.id),n.name,'character-128');
  /* monsters actually met: in the zones that are on the map, and in the fights the story starts */
  G.rp.s=G.rpNewState();G.rpApplyWorld();const letters=new Set(G.rp.grid.flat()),used=new Set();
  for(const z in G.RP_ZONE)if(letters.has(z))Object.keys(G.RP_ZONE[z].t).forEach(k=>used.add(k));
  (function scan(o){if(!o||typeof o!=='object')return;if(Array.isArray(o.fight))o.fight[0].forEach(k=>used.add(k));for(const k in o)scan(o[k])})(G.TALK);
  for(const k of used){const E=G.RP_E[k];add(E.boss?'Bosses':'Monsters',E.art||k,E.n,E.boss&&!E.art?'boss-256':'character-128')}
  for(const [who,name,tpl] of [['Fennel','fennel'],['Brass','brass'],['Saffi','saffi'],['Cinder','cinder'],['Pell','pell'],['Mist','mist'],['Skipper Gull','gull'],['Snatchclaw','snatchclaw'],['Glitterbeak','glitterbeak','boss-256'],['The Old Guardian','old-guardian','boss-256']])
    add('Coming later (story)',name,who,tpl||'character-128');
  const TILE_WHO={'tile-grass':'grass','tile-tallgrass':'tall grass (fights)','tile-forest-floor':'forest floor (fights)','tile-tree':'tree (stands on grass)','tile-flowers':'flowers (on grass)',
    'tile-water':'water','tile-path':'dirt path','tile-rock':'rock / cliff','tile-sand':'sand','tile-cactus':'cactus (on sand)','tile-snow':'snow','tile-pine':'snowy pine (on snow)',
    'tile-gravel':'mountain gravel','tile-cave':'cave floor','tile-bridge':'bridge, going up','tile-bridge-across':'bridge, going across','tile-sign':'sign (on grass)','tile-fountain':'healing fountain','tile-fence':'fence post'};
  for(const n of Object.values(G.TILE_ART))add('Map tiles',n,TILE_WHO[n]||n,'tile-64');
  let md='# Drawings the game can use\n\nEvery file is already waiting in `art/sprites/` as a copy of its template (grid and all). Open it in Paint.NET, '+
    'draw on a new layer, hide the grid layer, and save over it. Untouched copies are ignored, so the game keeps its own look until you draw. '+
    'This list is made by the build, so it always matches the game. ✅ = drawn, ⬜ = still the placeholder.\n\n'+
    'Done: **'+rows.filter(r=>have.has(r.name)).length+' of '+rows.length+'**\n';
  let g='';for(const r of rows){if(r.group!==g){g=r.group;md+='\n## '+g+'\n\n| | file name | who / what | template |\n|---|---|---|---|\n'}
    md+='| '+(have.has(r.name)?'✅':'⬜')+' | `'+r.name+'.png` | '+r.who+' | '+r.tpl+'.png |\n'}
  const unknown=[...have].filter(n=>!seen.has(n));
  if(unknown.length)md+='\n## Not used by the game (check the name)\n\n'+unknown.map(n=>'- `'+n+'.png`').join('\n')+'\n';
  return{md,rows,unknown}}
if(require.main===module){const r=artList(require(R+'/test/lib/game.js')());fs.writeFileSync(R+'/art/WANTED.md',r.md);console.log('art/WANTED.md: '+r.rows.length+' drawings')}
/* a ready-to-open copy of the template for every drawing that has no file yet */
function makePlaceholders(rows){let n=0;for(const r of rows){const f=R+'/art/sprites/'+r.name+'.png';if(!fs.existsSync(f)){fs.copyFileSync(R+'/art/templates/'+r.tpl+'.png',f);n++}}return n}
module.exports={artList,makePlaceholders};
