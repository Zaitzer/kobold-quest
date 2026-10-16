/* every screen of the game, reached from a loaded save: used by the style snapshot and the CSS tools */
module.exports={
  title:async p=>{},
  map:async p=>{await p.click('#go-rpg');await p.waitForTimeout(400);await p.evaluate(()=>{__rp.grace=1e9})},
  dialog:async p=>{await p.evaluate(()=>{__rp.mode='map';__kq.talk('elder')});await p.waitForTimeout(250)},
  menu:async p=>{await p.evaluate(()=>{__rp.dlg=null;__rp.mode='menu'});await p.waitForTimeout(250)},
  shop:async p=>{await p.evaluate(()=>{__rp.mode='shop'});await p.waitForTimeout(250)},
  levelup:async p=>{await p.evaluate(()=>{__rp.s.party[0].pend=1;__rp.mode='map'});await p.waitForTimeout(400)},
  hero:async p=>{await p.evaluate(()=>{__rp.s.party[0].pend=0;__rp.mode='map'});await p.waitForTimeout(200);await p.click('#rp-panel [data-rp="hero"]');await p.waitForTimeout(300)},
  battle:async p=>{await p.evaluate(()=>{document.getElementById('rp-hero').hidden=true;__rp.mode='map';__rpB.battle(['scout','slinger'],{zone:','})});await p.waitForTimeout(400)},
  cls:async p=>{await p.evaluate(()=>{__rp.mode='class'});await p.waitForTimeout(250)},
  smith:async p=>{await p.evaluate(()=>{__rp.mode='smith'});await p.waitForTimeout(250)},
  promote:async p=>{await p.evaluate(()=>{__rp.s.party[1].lvl=8;__rp.mode='promote'});await p.waitForTimeout(250)},
  chat:async p=>{await p.evaluate(()=>{const n=__net;n.on=true;n.chatLog=[{who:'Bob',txt:'hello there',me:false},{who:'Me',txt:'hi!',me:true}];__rp.mode='chat'});await p.waitForTimeout(250)},
  who:async p=>{await p.evaluate(()=>{__rp.mode='who'});await p.waitForTimeout(250)},
  trade:async p=>{await p.evaluate(()=>{__rp.mode='trade'});await p.waitForTimeout(250)},
  lobby:async p=>{await p.evaluate(()=>{__net.lob={id:'x1',host:true,duel:false,keys:['scout','slinger'],opt:{zone:','},hsel:[0],sel:[0],g:null};__rp.mode='lobby'});await p.waitForTimeout(250)},
  market:async p=>{await p.evaluate(()=>{const n=__net;n.market=[{id:'a1',by:'bob',name:'Bob',kind:'item',val:'bt_frog',price:25}];n.mine=[];n.mkTab='buy';n.mkSell=null;__rp.mode='market'});await p.waitForTimeout(250)},
};
