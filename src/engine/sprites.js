/* Joakim's drawings (art/sprites/*.png in the repo). When a drawing exists it is used in place of the look drawn in code;
   when it doesn't, nothing changes. Names are the ones in art/WANTED.md: a character's id (pip, elder, grubb...) or a
   tile's name (tile-grass...).
   Characters are drawn on the 128 × 128 template (bosses 256 × 256), facing right, feet on the line at 112/128 of the
   height. A drawing whose feet are a little off the line is moved onto it. */
const SPR={};let onLoad=[];
/* list: {name: url}. Called once at start with the website's art folder or the drawings built into the page */
function spritesInit(list){
  for(const n in list){if(SPR[n])continue;const img=new Image(),s={img,ready:false};SPR[n]=s;
    img.onload=()=>{s.w=img.naturalWidth;s.h=img.naturalHeight;s.feet=feetOf(img);s.ready=true;onLoad.forEach(f=>f(n))};img.onerror=()=>{delete SPR[n]};img.src=list[n]}}
/* where the feet are: the lowest drawn row, if it is close to the template's line; otherwise the line itself */
function feetOf(img){const W=img.naturalWidth,H=img.naturalHeight,line=H*112/128;
  try{const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(0,0,W,H).data;
    for(let y=H-1;y>=0;y--){for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>40){const b=y+1;return Math.abs(b-line)<=H*.15?b:line}}}catch(e){}
  return line}
function sprite(n){const s=n&&SPR[n];return s&&s.ready?s:null}
function onSpriteLoad(f){onLoad.push(f)}
/* draw a character drawing with its feet at (0,0), in a kobold's own units (a 128 template is about as tall as a drawn kobold) */
const SPRITE_UNIT=76/128;
function drawCharSprite(g,s,size){const u=SPRITE_UNIT*(s.w>200?1/Math.max(1,size):1);g.drawImage(s.img,-s.w/2*u,-s.feet*u,s.w*u,s.h*u)}
/* the art name for a party member or player: their name, lower case, dashes for spaces */
const artName=name=>String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export {SPR,SPRITE_UNIT,artName,drawCharSprite,feetOf,onLoad,onSpriteLoad,sprite,spritesInit};
