/* Loading Joakim's sprite sheets (art/, see engine/sheets.js): name → image, ready once loaded. */
const SPR={};let onLoad=[];
/* list: {name: url}. Called once at start with the website's art folder or the sheets built into the page */
function spritesInit(list){
  for(const n in list){if(SPR[n])continue;const img=new Image(),s={img,ready:false};SPR[n]=s;
    img.onload=()=>{s.w=img.naturalWidth;s.h=img.naturalHeight;s.ready=true;onLoad.forEach(f=>f(n))};img.onerror=()=>{delete SPR[n]};img.src=list[n]}}
function sprite(n){const s=n&&SPR[n];return s&&s.ready?s:null}
function onSpriteLoad(f){onLoad.push(f)}
/* the art name for a character: its name, lower case, dashes for spaces */
const artName=name=>String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export {SPR,artName,onLoad,onSpriteLoad,sprite,spritesInit};
