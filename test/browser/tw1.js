const {chromium}=require('playwright');
const SAVE=JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'../fixtures/save_v2.json'),'utf8'));
SAVE.inv.push('bt_frog#swift#bear','cl_moss#hale','rg_mana#owl','cap_leaf');SAVE.mats={moss:6,shard:5,spore:5,scrap:2,fang:1};
(async()=>{const b=await chromium.launch();
 const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
 const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 await p.addInitScript(()=>{try{localStorage.setItem('kobold-pit-rpopt',JSON.stringify({}))}catch(e){}});await p.goto('file://'+require('path').join(__dirname,'../../dist/kq_test.html'));await p.addStyleTag({content:'#boot{display:none!important}'});
 await p.evaluate(s=>localStorage.setItem('kobold-pit-rpg',JSON.stringify(s)),SAVE);
 await p.tap('#go-rpg');await p.waitForTimeout(400);
 const goTo=async(x,y,face)=>{await p.evaluate(([x,y,f])=>{const s=__rp.s;s.x=x;s.y=y;s.face=f;__rp.grace=99},[x,y,face]);await p.waitForTimeout(150)};
 const panel=async()=>(await p.locator('#rp-panel').innerText()).replace(/\n/g,' | ').slice(0,160);
 const clear=async()=>{for(let i=0;i<12;i++){if(await p.locator('#rp-panel [data-rp="talent"]').count()){await p.tap('#rp-panel [data-rp="talent"] >> nth=0');await p.waitForTimeout(120)}else if(await p.locator('#rp-panel [data-g="promote"]').count()){await p.tap('#rp-panel [data-g="promote"] >> nth=0');await p.waitForTimeout(120)}else break}};
 const act=async()=>{await p.waitForTimeout(150);await clear();await p.tap('#rp-panel [data-rp="act"]');await p.waitForTimeout(200)};
 // smith
 await goTo(12,24,'down');await act();console.log('clink:',await panel());
 while(await p.locator('#rp-panel [data-rp="next"]').count()){await p.tap('#rp-panel [data-rp="next"]');await p.waitForTimeout(80)}
 if(await p.locator('#rp-panel [data-rp="choose"]').count()){await p.tap('#rp-panel [data-rp="choose"] >> nth=1');await p.waitForTimeout(150)}
 console.log('smith panel:',await panel());await p.screenshot({path:__dirname+'/../out/w1_smith.png'});
 await p.tap('#rp-panel [data-g="craft"] >> nth=0');await p.waitForTimeout(150);
 console.log('after craft inv tail',await p.evaluate(()=>__rp.s.inv.slice(-2)),'mats',await p.evaluate(()=>JSON.stringify(__rp.s.mats)));
 await p.tap('#rp-panel [data-g="leave"]');await p.waitForTimeout(150);
 // light the forge (spores), then reforge
 await act();while(await p.locator('#rp-panel [data-rp="next"]').count()){await p.tap('#rp-panel [data-rp="next"]');await p.waitForTimeout(80)}
 await p.waitForTimeout(150);console.log('forge',await p.evaluate(()=>__rp.s.q.forge),'xp',await p.evaluate(()=>__rp.s.party[0].xp));
 await act();await p.tap('#rp-panel [data-g="reforge"]');await p.waitForTimeout(150);await p.tap('#rp-panel [data-g="refpick"] >> nth=0');await p.waitForTimeout(150);
 console.log('reforged:',await p.evaluate(()=>__rp.s.inv.filter(i=>i.includes('#'))));
 await p.tap('#rp-panel [data-g="smithback"]');await p.tap('#rp-panel [data-g="leave"]');await p.waitForTimeout(150);
 // board
 await goTo(7,20,'up');await act();console.log('board:',await panel());
 while(await p.locator('#rp-panel [data-rp="next"]').count()){await p.tap('#rp-panel [data-rp="next"]');await p.waitForTimeout(80)}
 // pebble
 await goTo(7,26,'down');await act();console.log('pebble:',await panel());
 if(await p.locator('#rp-panel [data-rp="choose"]').count()){await p.tap('#rp-panel [data-rp="choose"] >> nth=0');await p.waitForTimeout(150)}
 // shrine
 await goTo(12,26,'down');await act();console.log('shrine:',await panel());
 if(await p.locator('#rp-panel [data-rp="next"]').count())await p.tap('#rp-panel [data-rp="next"]');
 await p.tap('#rp-panel [data-rp="choose"] >> nth=0');await p.waitForTimeout(300);console.log('after shrine mode',await p.evaluate(()=>__rp.mode),'pend',await p.evaluate(()=>__rp.s.party[0].pend));
 for(let i=0;i<5&&await p.locator('#rp-panel [data-rp="talent"]').count();i++){await p.tap('#rp-panel [data-rp="talent"] >> nth=0');await p.waitForTimeout(150)}
 // promotion
 await clear(); await p.evaluate(()=>{__rp.s.party[1].lvl=8;__rp.s.party[1].adv=null});await p.waitForTimeout(300);console.log('promote:',await panel());await p.screenshot({path:__dirname+'/../out/w1_promote.png'});
 if(await p.locator('#rp-panel [data-g="promote"]').count()){await p.tap('#rp-panel [data-g="promote"] >> nth=0');await p.waitForTimeout(200)}
 console.log('adv',await p.evaluate(()=>__rp.s.party.map(m=>m.adv||'-').join()),'mode',await p.evaluate(()=>__rp.mode));
 // hero screen with magic + set items
 await p.tap('#rp-panel [data-rp="hero"]');await p.waitForTimeout(300);await p.screenshot({path:__dirname+'/../out/w1_hero.png'});await p.locator('#rp-hero [data-hh="close"]').click();
 // sound + music
 await p.tap('#rp-panel [data-rp="menu"]');await p.waitForTimeout(100);await p.tap('#rp-panel [data-opt="snd"]');await p.waitForTimeout(100);
 await p.screenshot({path:__dirname+'/../out/w1_menu.png'});await p.tap('#rp-panel [data-rp="close"]');
 // walk with the keyboard diagonally
 const pos0=await p.evaluate(()=>({...__rp.pos}));await p.keyboard.down('ArrowRight');await p.keyboard.down('ArrowDown');await p.waitForTimeout(500);await p.keyboard.up('ArrowRight');await p.keyboard.up('ArrowDown');
 console.log('diag walk',pos0,'->',await p.evaluate(()=>({...__rp.pos})),'music',await p.evaluate(()=>typeof soundOn));
 await p.waitForTimeout(1500);
 console.log('errors',errs);await b.close()})();
