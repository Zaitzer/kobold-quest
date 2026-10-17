/* Music and sounds: every place has a tune, every tune can be built, jingles pick the biggest moment. */
const G=require('../lib/game.js')();let fails=0;const bad=m=>{fails++;console.log('FAIL',m)};
const town=n=>G.sites().find(s=>s.name===n);
// every route kind and town on the region gets a track that exists and builds
const seen=new Set();
for(let y=0;y<G.WH;y+=5)for(let x=0;x<G.WW;x+=5){const k=G.regionMusic(x,y);if(k===null){if(x>=G.OLD_W||y>=G.OLD_H)bad('no tune at '+x+','+y);continue}seen.add(k)}
for(const k of seen){const T=G.rpTrack(k);if(!T||!G.RP_SCALES[T.sc]||!G.RP_DRUMS[T.dr])bad('track '+k+' is broken');
  const S=G.rpSong(T);if(S.mel.length!==64)bad('song for '+k+' has '+S.mel.length+' notes');
  if(S.mel.some(m=>m&&!isFinite(G.mtof(S.deg(m.d,1)))))bad('song for '+k+' has a bad note')}
for(const k of ['town:A','town:E','meadow','pass','woods'])if(!seen.has(k))bad('the slice never plays '+k);
if(G.regionMusic(town('Pebblebrook').x,town('Pebblebrook').y)!=='town:A')bad('Pebblebrook plays the wrong tune');
if(G.regionMusic(town('Copperhollow').x,town('Copperhollow').y)!=='town:E')bad('Copperhollow plays the wrong tune');
if(G.rpTrack('town:A').root===G.rpTrack('town:E').root&&G.rpTrack('town:A').sc===G.rpTrack('town:E').sc)bad('towns all sound the same');
if(G.rpTrack('nonsense')!==G.RP_TRACKS.meadow)bad('unknown track should fall back to the meadow');
// jingles: the biggest moment wins, nothing for no change
const o={sparks:1,n:3,lv:10};
if(G.jingleFor(o,{sparks:2,n:4,lv:12})!=='spark')bad('spark should win');
if(G.jingleFor(o,{sparks:1,n:4,lv:12})!=='recruit')bad('recruit should beat level');
if(G.jingleFor(o,{sparks:1,n:3,lv:11})!=='level')bad('level up jingle');
if(G.jingleFor(o,{sparks:1,n:3,lv:10})!==null)bad('jingle with no change');
// moving kobolds between party and inn is not a level up
const s=G.rpNewState();const a=G.jingleSig(s);s.roster=[s.party.pop()];if(G.jingleFor(a,G.jingleSig(s)))bad('swap played a jingle');
// talk blips: same speaker same pitch, narration plain, pitches in a sane range
if(G.blipPitch('Ruddle')!==G.blipPitch('Ruddle')||G.blipPitch('')!==1)bad('blip pitch');
for(const w of ['Pip','Grubb','Elder Yarrow','Fennel'])if(G.blipPitch(w)<.8||G.blipPitch(w)>1.4)bad('blip pitch for '+w);
for(const k of ['spark','level','recruit','item','lose'])if(!G.JINGLES[k])bad('missing jingle '+k);
console.log((fails?'FAIL':'ok')+' audio: tunes for every place, jingles, talk blips');process.exitCode=fails?1:0;
