#!/usr/bin/env node
'use strict';
/* Sensitivity runs: move each key number by -20% and +20%, measure the feel metrics, flag the ones that break a band.
   Usage: node tools/balance-sensitivity.js */
const m=require('./balance-model.js'),P=m.P;
const PK=[['fighter','cleric','wizard'],['ranger','monk','sorcerer'],['barbarian','bard','rogue'],['paladin','wizard','cleric'],['rogue','sorcerer','bard'],['monk','barbarian','cleric']];
const BOSSES=[[5,7],[18,8],[30,12]];
function metrics(){m.resetClasses();let r=0,l=0,n=0,w=0,wn=0;
  for(const p of PK)for(const L of [10,25]){const s=m.runFights(p,L,L,250,'competent',9);r+=s.rounds;l+=s.lost;n++}
  for(const p of PK)for(const [L,R] of BOSSES){const b=m.bossRule(L,R);w+=m.bossRun(p,L,b.k,0,150,{hit:b.hit,acts:3}).win;wn++}
  return{rounds:r/n,lost:l/n,boss:w/wn}}
const scale=(obj,key,f)=>{const o=obj[key];obj[key]=typeof o==='function'?x=>o(x)*f:o*f;return()=>{obj[key]=o}};
const PARAMS=[
 ['foe HP (4 x basic hit)',f=>scale(P,'foeHpMult',f)],
 ['foe damage (share of fighter HP)',f=>scale(P,'foeHitShare',f)],
 ['pack hit chance (melee, ranged)',f=>{const a=scale(P.hit,'melee',f),b=scale(P.hit,'ranged',f);return()=>{a();b()}}],
 ['foes\' hit chance',f=>scale(P,'foeHit',f)],
 ['gear share (atk, def, HP)',f=>{const a=scale(P.gear,'atk',f),b=scale(P.gear,'def',f),c=scale(P.gear,'hp',f);return()=>{a();b();c()}}],
 ['talents per level',f=>{const a=scale(P.talents,'atk',f),b=scale(P.talents,'def',f),c=scale(P.talents,'hp',f);return()=>{a();b();c()}}],
 ['mana pools',f=>scale(P,'manaK',f)],
 ['mercy bonus after two misses',f=>scale(P,'mercy',f)],
 ['crit chance',f=>scale(P,'crit',f)],
 ['potion strength',f=>scale(P,'potion',f)],
 ['foes per fight',f=>scale(P,'foesPerFight',f)],
 ['boss damage budget T',f=>{const o=P.bossT.slice();P.bossT=[o[0]*f,o[1]*f];return()=>{P.bossT=o}}],
 ['boss HP multiple k',f=>{const o=P.bossK.slice();P.bossK=[o[0]*f,o[1]*f];return()=>{P.bossK=o}}],
];
const band=(x,a,b)=>x<a?'LOW':x>b?'HIGH':'ok';
const base=metrics();
console.log(`base: rounds ${base.rounds.toFixed(2)}  HP lost ${(base.lost*100).toFixed(0)}%  boss win ${(base.boss*100).toFixed(0)}%\n`);
console.log('| number | -20%: rounds / lost / boss | +20%: rounds / lost / boss | breaks a band? |');
console.log('|---|---|---|---|');
for(const [name,mk] of PARAMS){const row=[];let broke=[];
  for(const f of [.8,1.2]){const undo=mk(f);const x=metrics();undo();
    row.push(`${x.rounds.toFixed(1)} / ${(x.lost*100).toFixed(0)}% / ${(x.boss*100).toFixed(0)}%`);
    const flags=[band(x.rounds,2.5,4.5)!=='ok'?'rounds '+band(x.rounds,2.5,4.5):'',band(x.lost,.15,.35)!=='ok'?'loss '+band(x.lost,.15,.35):'',band(x.boss,.5,.9)!=='ok'?'boss '+band(x.boss,.5,.9):''].filter(Boolean);
    if(flags.length)broke.push((f<1?'-20%: ':'+20%: ')+flags.join(', '))}
  console.log(`| ${name} | ${row[0]} | ${row[1]} | ${broke.length?'**'+broke.join('; ')+'**':'no'} |`)}
