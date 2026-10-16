/* Yips: louder close by, silent far away or in another room, panned to the side the yipper stands on. */
const G=require('../lib/game.js')();let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m)}};
G.rp.s=G.rpNewState();G.rpApplyWorld();const me={x:10,y:10};
const near=G.netYipLevel(me,{x:11,y:10}),mid=G.netYipLevel(me,{x:17,y:10}),far=G.netYipLevel(me,{x:30,y:10}),left=G.netYipLevel(me,{x:4,y:10});
ok(near.vol>mid.vol&&mid.vol>far.vol,'volume falls with distance '+[near.vol,mid.vol,far.vol]);ok(far.vol===0,'out of range is silent');
ok(near.pan>0&&left.pan<0,'panned to the right side');ok(near.vol>.85,'next to you is nearly full volume');
ok(G.netYipLevel(me,{x:11,y:10,pl:'inn'})===null,'someone inside the inn is not heard outside');
G.rp.s.place='inn';ok(G.netYipLevel(me,{x:11,y:10,pl:'inn'})!==null,'inside the same room you hear each other');
ok(Math.abs(G.netYipPitch('u_a')-G.netYipPitch('u_b'))>0.001&&G.netYipPitch('u_a')===G.netYipPitch('u_a'),'each player has their own steady pitch');
console.log(fails?'FAIL':'ok','yips:',fails,'problems');process.exitCode=fails?1:0;
