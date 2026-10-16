const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const vp of [{n:'phone',width:390,height:844},{n:'desk',width:1000,height:800}]){
const p=await b.newPage({viewport:{width:vp.width,height:vp.height}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').join(__dirname,'../../dist/kq_test.html'));await p.addStyleTag({content:'#boot{display:none!important}'});
// seed a save with gear in the backpack and a pending level-up
await p.evaluate(()=>{localStorage.setItem('kobold-pit-rpg',JSON.stringify({v:2,x:7,y:23,face:'down',gold:300,party:[{name:'Pip',cls:'ranger',w:'popgun',lvl:4,xp:5,hp:50,mp:12,tal:['sharp','aimed'],eq:{head:'cap_leaf',boots:'bt_frog'},pend:1,offer:null},{name:'Bork',cls:'warrior',w:'bone',lvl:4,xp:0,hp:60,mp:10,tal:['might'],eq:{},pend:0,offer:null},{name:'Wizzle',cls:'mage',w:'frostrod',lvl:4,xp:0,hp:40,mp:30,tal:['fireball'],eq:{},pend:0,offer:null}],bag:{potion:3,ether:1,feather:0},inv:['rg_might','rg_life','sh_quiver','ar_scale','cl_shadow','am_tooth','w_blunder','sh_tome','cap_crown','w_sword'],chests:[],q:{q1:2,kills:5,q2:1,glow:1,key:0,gate:0,gorb:0,vexx:0,bork:1,wizzle:0,intro:1,cls:1},taken:[],steps:40}))});
await p.click('#go-rpg');await p.waitForTimeout(600);
await p.screenshot({path:__dirname+'/../out/h0_'+vp.n+'.png'});
console.log(vp.n,'levelup panel:',(await p.locator('#rp-panel').innerText()).slice(0,160).replace(/\n/g,' | '));
await p.click('#rp-panel [data-rp="talent"] >> nth=0');await p.waitForTimeout(300);
await p.click('#rp-panel [data-rp="hero"]');await p.waitForTimeout(300);
// tap ring in backpack then a ring slot
await p.click('#rp-hero [data-bag="0"]');await p.waitForTimeout(100);
await p.screenshot({path:__dirname+'/../out/h1_'+vp.n+'.png'});
await p.click('#rp-hero [data-slot="ring1"]');await p.waitForTimeout(100);
// drag the quiver onto the shield slot
const src=await p.locator('#rp-hero .hh-cell.full >> nth=1').boundingBox(),dst=await p.locator('#rp-hero [data-slot="shield"]').boundingBox();
await p.mouse.move(src.x+src.width/2,src.y+src.height/2);await p.mouse.down();await p.mouse.move(src.x+40,src.y-20,{steps:5});await p.mouse.move(dst.x+dst.width/2,dst.y+dst.height/2,{steps:8});await p.mouse.up();await p.waitForTimeout(200);
await p.screenshot({path:__dirname+'/../out/h2_'+vp.n+'.png'});
console.log(vp.n,'hero info:',(await p.locator('#rp-hero .hh-info').innerText()).slice(0,120));
const eq=await p.evaluate(()=>JSON.parse(localStorage.getItem('kobold-pit-rpg')).party[0].eq);
await p.click('#rp-hero [data-hh="close"]');await p.waitForTimeout(200);
const eq2=await p.evaluate(()=>JSON.parse(localStorage.getItem('kobold-pit-rpg')).party[0].eq);
console.log(vp.n,'saved eq',JSON.stringify(eq2),'errors',errs);
await p.close()}
await b.close()})();
