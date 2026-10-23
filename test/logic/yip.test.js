/* Yips: louder close by, silent far away or in another room, panned to the side the yipper stands on. */
const G=require('../lib/game.js')();let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m)}};
G.rp.s=G.rpNewState();G.rp.s.q.act=7;G.rp.s.w6='pebblebrook';const me={x:10,y:10},here=G.rpPlace();
const near=G.netYipLevel(me,{x:11,y:10,pl:here}),mid=G.netYipLevel(me,{x:17,y:10,pl:here}),far=G.netYipLevel(me,{x:30,y:10,pl:here}),left=G.netYipLevel(me,{x:4,y:10,pl:here});
ok(near.vol>mid.vol&&mid.vol>far.vol,'volume falls with distance '+[near.vol,mid.vol,far.vol]);ok(far.vol===0,'out of range is silent');
ok(near.pan>0&&left.pan<0,'panned to the right side');ok(near.vol>.85,'next to you is nearly full volume');
ok(G.netYipLevel(me,{x:11,y:10,pl:'w6:room:pebinn'})===null,'someone inside the inn is not heard outside');
G.rp.s.w6='room:pebinn';ok(G.netYipLevel(me,{x:11,y:10,pl:G.rpPlace()})!==null,'inside the same room you hear each other');
ok(Math.abs(G.netYipPitch('u_a')-G.netYipPitch('u_b'))>0.001&&G.netYipPitch('u_a')===G.netYipPitch('u_a'),'each player has their own steady pitch');
console.log(fails?'FAIL':'ok','yips:',fails,'problems');process.exitCode=fails?1:0;
