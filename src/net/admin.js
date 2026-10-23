/* ---------- Admin tools, the game's side (build step 16, systems.md §17) ----------
   The Admin screen in ☰ (owner and moderators): one tab per job, two to three taps per action; every tool runs and is checked
   on the server (server/admin.js). The player's side: the message of the day, announcements, warnings, mutes, the festival,
   the report button, error reports, and the fixes an admin leaves in a hero's save (applied when the hero is played). */
import {v6XpNeed} from '../battle/v6end.js';
import {rpUI} from '../core/hooks.js';
import {feature} from '../core/registry.js';
import {rp} from '../core/state.js';
import {MAPS6} from '../data/v6/maps.js';
import {esc2} from '../engine/util.js';
import {rpSay,rpToast} from '../game/dialogue.js';
import {v6LevelUp} from '../game/v6talent.js';
import {net} from './core.js';
import {adminCall} from './mail.js';

const ADM={tab:'server',d:{},acct:null,hero:null,msg:'',code:null,busy:false};
const TABS=[['server','Server'],['players','Players'],['mod','Moderation'],['market','Market'],['events','Events'],['letters','Letters'],['tests','Tests'],['log','Log']];
const me=()=>net.online&&net.online.account.me;
const owner=()=>!!(me()&&me().role==='owner');
const v=id=>{const i=typeof document!=='undefined'&&document.getElementById(id);return i?i.value.trim():''};
const day=t=>t?new Date(t).toISOString().slice(0,10):'—';
const admAgo=t=>{if(!t)return'never';const m=(Date.now()-t)/60e3;return m<2?'now':m<120?Math.round(m)+' min ago':m<2880?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'};
async function call(tool,o,keep){ADM.busy=true;rpUI(true);try{const r=await net.online.account.call(Object.assign({k:'adm',tool},o||{}));ADM.d[keep||tool]=r;ADM.msg=keep===false?'Done.':ADM.msg;ADM.busy=false;rpUI(true);return r}
  catch(e){ADM.msg=e.message||'That did not work.';ADM.busy=false;rpUI(true);return null}}
async function act(tool,o,after){ADM.msg='';const r=await call(tool,Object.assign({why:v('adm-why')},o),false);if(r!==null){ADM.msg='Done.';if(after)await after(r)}rpUI(true)}
/* each tab loads what it shows */
function open(tab){ADM.tab=tab;ADM.msg='';ADM.code=null;
  if(tab==='server'){call('status');if(owner())call('mods')}
  if(tab==='mod'){call('reports');call('words');call('chatlog')}
  if(tab==='market'){call('listings');if(owner())call('gifts')}
  if(tab==='log'){call('log');if(owner())call('errors')}
  if(tab==='players'&&ADM.acct)reloadAcct();
  if(tab==='tests'&&net.me)call('find',{q:me().name.toLowerCase()},'mine')}
async function reloadAcct(){const r=await call('find',{q:ADM.acct.name.toLowerCase()},'find');const a=(r||[]).find(x=>x.name.toLowerCase()===ADM.acct.name.toLowerCase());if(a)ADM.acct=a}
const btn=(a,label,sub,cls,data)=>'<button class="rpb'+(cls?' '+cls:'')+'" type="button" data-rp="'+a+'"'+Object.entries(data||{}).map(([k,x])=>' data-'+k+'="'+esc2(String(x))+'"').join('')+(ADM.busy?' disabled':'')+'>'+label+(sub?'<small>'+sub+'</small>':'')+'</button>';
const input=(id,ph,type)=>'<div class="chatin"><input id="'+id+'" type="'+(type||'text')+'" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="'+esc2(ph)+'"></div>';
const why='<div class="chatin"><input id="adm-why" type="text" maxlength="200" autocomplete="off" placeholder="Reason (the player sees it)"></div>';
function adminScreenHtml(){const M=me();if(!M||!M.role)return'<div class="rpdlg"><p>Admins only.</p></div><div class="tbar">'+btn('admx','Back','','x')+'</div>';
  let h='<div class="rpcmd">'+TABS.map(([k,n])=>'<button class="pill'+(ADM.tab===k?' go':'')+'" type="button" data-rp="admtab" data-v="'+k+'">'+n+'</button>').join('')+'</div><div class="rpdlg">';
  const D=ADM.d;
  switch(ADM.tab){
    case'server':{const S=D.status;h+='<div class="who">Server</div>'+(S?'<p>Build <b>'+esc2(S.build)+'</b>'+(typeof BUILD_ID!=='undefined'&&S.build!==BUILD_ID?' (this page: '+esc2(BUILD_ID)+')':'')+' · up '+Math.round(S.up/3600)+' h · '+S.online+' online · '+S.accounts+' accounts · data '+Math.round(S.size/1024)+' KB · last backup '+esc2(S.backup||'none')+(S.maint?' · <b class="hp">maintenance on</b>':'')+'</p>':'<p>Loading…</p>')+'</div>';
      if(owner())h+='<div class="rpdlg"><small>Message of the day'+(S&&S.motd?': '+esc2(S.motd):'')+'</small></div>'+input('adm-motd','A line shown once at login (empty clears it)')+'<div class="rpcmd">'+btn('admmotd','Set the message of the day')+'</div>';
      h+=input('adm-ann','A message to everyone online now')+'<div class="rpcmd">'+btn('admann','Announce','a toast for everyone online')+'</div>';
      if(owner())h+='<div class="rpcmd">'+(S&&S.maint?btn('admmaint','Maintenance off','logins open again','go',{v:0}):btn('admmaint','Maintenance on','blocks logins; signs players out in 2 minutes','x',{v:1}))+'</div>'+
        '<div class="rpdlg"><small>Moderators: '+esc2((D.mods||[]).join(', ')||'none')+'</small></div>'+input('adm-who','Account name')+'<div class="rpcmd">'+btn('admmod','Make moderator','','',{op:'add'})+btn('admmod','Remove moderator','','x',{op:'del'})+'</div>';
      break}
    case'players':{h+='<div class="who">Players</div></div>'+input('adm-q','Search accounts by name')+'<div class="rpcmd">'+btn('admfind','Find')+'</div>';
      if(!ADM.acct&&D.find)h+='<div class="rpcmd">'+(D.find.length?D.find.map((a,i)=>btn('admacct',esc2(a.name)+(a.online?' ●':''),'seen '+admAgo(a.seen)+' · '+a.heroes.length+' heroes'+(a.ban?' · banned':a.mute?' · muted':'')+(a.warns?' · '+a.warns+' warnings':''),'',{v:i})).join(''):'<p class="rptip">Nobody by that name.</p>')+'</div>';
      const A=ADM.acct;if(A&&!ADM.hero){h+='<div class="rpdlg"><div class="who">'+esc2(A.name)+(A.online?' (net.online)':'')+'</div><p>Made '+day(A.created)+' · seen '+admAgo(A.seen)+' · warnings '+A.warns+(A.mute?' · muted to '+new Date(A.mute).toLocaleString():'')+(A.ban?' · banned '+(A.ban<0?'for good':'to '+day(A.ban)):'')+(A.deleted?' · deleted '+day(A.deleted):'')+'</p></div>';
        h+='<div class="rpcmd">'+A.heroes.map(x=>btn('admhero',esc2(x.name||'?')+' · '+x.lvl,'slot '+(x.slot+1)+(x.deleted?' · deleted':'')+(x.test?' · test':''),x.deleted?'x':'',{v:x.slot})).join('')+'</div>'+why;
        h+='<div class="rpcmd">'+btn('admdo','Warn','shown at next login','',{t:'warn'})+['hour','day','week'].map(f=>btn('admdo','Mute a'+(f==='hour'?'n ':' ')+f,'no chat','',{t:'mute',f})).join('')+['day','week','ever'].map(f=>btn('admdo',f==='ever'?'Ban for good':'Ban a '+f,'','x',{t:'ban',f})).join('')+
          ['warn','mute','ban'].map(w=>btn('admdo','Undo the last '+w,'','',{t:'undo',w})).join('')+'</div>'+input('adm-to','New account name')+'<div class="rpcmd">'+btn('admdo','Rename the account','the player is told why','',{t:'rename'})+'</div>';
        if(owner())h+='<div class="rpcmd">'+btn('admdo','Password reset code','a one-time code for the player; you never see the password','',{t:'pwreset'})+'</div>'+(ADM.code?'<p class="rptip">Code for '+esc2(A.name)+': <b>'+esc2(ADM.code)+'</b> (one day; shown once)</p>':'')+
          input('adm-typed','Type the account name to delete it')+'<div class="rpcmd">'+btn('admdo','Delete the account','kept 7 days','x',{t:'delacct'})+'</div>';
        h+='<div class="rpcmd">'+btn('admback','Back to the list','','x')+'</div>'}
      if(A&&ADM.hero){const H=D.hero;h+='<div class="rpdlg"><div class="who">'+esc2(A.name)+' · slot '+(ADM.hero.slot+1)+'</div>'+(H?'<p><b>'+esc2(H.name||'?')+'</b> at '+esc2(H.place||'?')+' (fountain: '+esc2(H.respawn||'?')+') · '+(H.gold||0)+' gold · saved '+admAgo(H.savedAt)+(H.deleted?' · deleted '+day(H.deleted):'')+(H.test?' · test hero':'')+'</p><p><small>'+H.pack.map(k=>esc2(k.name)+' '+esc2(k.cls)+' '+k.lvl+' ('+k.hp+' HP)').join(' · ')+'</small></p><p><small>Flags: '+esc2(Object.entries(H.flags).map(([k,x])=>k+'='+x).join(' '))+'</small></p><p><small>Bag: '+esc2(Object.entries(H.bag).filter(([k,x])=>x).map(([k,x])=>k+' ×'+x).join(', ')||'empty')+'</small></p>':'<p>Loading…</p>')+'</div>'+why;
        const s={slot:ADM.hero.slot};h+='<div class="rpcmd">'+btn('admdo','Unstuck','to its last fountain','',Object.assign({t:'unstuck'},s))+btn('admdo','Release the lock','a vanished device','',Object.assign({t:'unlock'},s))+(H&&H.deleted?btn('admdo','Restore the hero','deleted under 7 days ago','go',Object.assign({t:'restore'},s)):'')+'</div>'+
          input('adm-to','New hero name')+'<div class="rpcmd">'+btn('admdo','Rename the hero','','',Object.assign({t:'renamehero'},s))+'</div>';
        if(owner()){h+=input('adm-flag','Story flag (one step on), e.g. pb')+input('adm-fv','Value','number')+'<div class="rpcmd">'+btn('admdo','Set the flag','','',Object.assign({t:'flag'},s))+'</div>'+
          input('adm-gold','Gold (up to 1000)','number')+input('adm-item','Item, e.g. potion')+'<div class="rpcmd">'+btn('admdo','Compensate','gold and/or an item, with the reason above','go',Object.assign({t:'compensate'},s))+btn('admdo','Compensate a level\'s XP','','go',Object.assign({t:'compensate',xp:1},s))+'</div>';
          h+='<div class="rpcmd">'+btn('admbackups','Restore from a backup…','pick a day; the current save is kept as a copy','',s)+(D.backups?D.backups.map(dd=>btn('admdo',dd,'restore this day','x',Object.assign({t:'restorebackup',day:dd},s))).join(''):'')+'</div>'}
        h+='<div class="rpcmd">'+btn('admback','Back to '+esc2(A.name),'','x')+'</div>'}
      break}
    case'mod':{const R=D.reports||[];h+='<div class="who">Reports ('+R.length+' open)</div></div>'+why;
      h+=R.map(r=>'<div class="rpdlg"><p><b>'+esc2(r.by)+'</b> about <b>'+esc2(r.about)+'</b> · '+admAgo(r.at)+(r.why?' · '+esc2(r.why):'')+'</p><p><small>'+r.lines.map(l=>esc2(l.by)+': '+esc2(l.txt)).join('<br>')+'</small></p></div><div class="rpcmd">'+
        [['none','No action'],['warn','Warn'],['mute','Mute a day'],['ban','Ban a day']].map(([k,n])=>btn('admclose',n,'','',{id:r.id,how:k})).join('')+'</div>').join('');
      h+='<div class="rpdlg"><div class="who">Word filter</div><p><small>'+esc2((D.words||[]).join(', ')||'empty')+'</small></p></div>'+input('adm-word','A word')+'<div class="rpcmd">'+btn('admword','Add','','',{op:'add'})+btn('admword','Remove','','x',{op:'del'})+'</div>';
      h+='<div class="rpdlg"><div class="who">World chat, last 24 hours</div><p><small>'+((D.chatlog||[]).slice(-40).map(l=>esc2(new Date(l.at).toTimeString().slice(0,5)+' '+l.by+': '+l.txt)).join('<br>')||'quiet')+'</small></p><p><small>Private messages are never shown.</small></p></div>';break}
    case'market':{h+='<div class="who">Listings</div></div>'+why+'<div class="rpcmd">'+((D.listings||[]).map(L=>btn('admunlist',esc2(L.kind+' '+L.val)+' · '+L.price+'g','from '+esc2(L.seller)+' · tap to remove (it goes back to the seller)','x',{id:L.id})).join('')||'<p class="rptip">Nothing for sale.</p>')+'</div>';
      if(owner())h+='<div class="rpdlg"><div class="who">Gifts (last 100)</div><p><small>'+((D.gifts||[]).map(g=>esc2(admAgo(g.at)+' '+g.from+' → '+g.to+': '+g.kind+' '+g.val)).join('<br>')||'none since the server started')+'</small></p></div>';break}
    case'events':{h+='<div class="who">Festival</div><p>A banner, bunting and a stamp for logging in during it. No XP or gold multipliers.</p></div>'+(owner()?input('adm-fest','Festival name')+input('adm-days','Days (1 to 31)','number')+'<div class="rpcmd">'+btn('admfest','Start the festival','','go')+btn('admfest','Stop it','','x',{stop:1})+'</div>':'<p class="rptip">Owner only.</p>');break}
    case'letters':h+='<div class="who">Letters</div><p>The messenger: the GitHub token and the list.</p></div><div class="rpcmd">'+btn('admletters','Open the messenger')+'</div>';break;
    case'tests':{const mine=(D.mine||[]).find(a=>a.name===me().name);h+='<div class="who">Test heroes</div><p>A test hero can jump to any flag, any level, any fight; it is hidden from the market, gifts and co-op credit.</p></div>'+
      (owner()?'<div class="rpcmd">'+(mine?mine.heroes.map(x=>btn('admtest',esc2(x.name)+(x.test?' (test)':''),x.test?'tap to make it normal':'tap to mark it test',x.test?'go':'',{v:x.slot,off:x.test?1:0})).join(''):'Loading…')+'</div>':'<p class="rptip">Owner only.</p>');break}
    case'log':{h+='<div class="who">Admin log'+(owner()?'':' (your own)')+'</div><p><small>'+((D.log||[]).map(l=>esc2(day(l.at)+' '+l.by+' '+l.tool+(l.on?' '+l.on:'')+(l.why?' — '+l.why:''))).join('<br>')||'empty')+'</small></p></div>';
      if(owner())h+='<div class="rpdlg"><div class="who">Errors from pages</div><p><small>'+((D.errors||[]).map(e=>esc2('×'+e.count+' '+e.build+' '+e.msg+(e.where?' ('+e.where+')':''))).join('<br>')||'none')+'</small></p></div><div class="rpcmd">'+btn('admerrclear','Clear the errors','','x')+'</div>';break}}
  if(ADM.msg)h+='<p class="tmsg">'+esc2(ADM.msg)+'</p>';
  return h+'<div class="tbar">'+btn('admx','Back','','x')+'</div>'}

/* the test hero's tools (owner only; the server marks the hero): any flag, any level, any fight */
let testFight=()=>{};function adminSetTestFight(f){testFight=f}
function testHeroHtml(){if(!rp.s||!rp.s.test)return'<div class="rpdlg"><p>Not a test hero.</p></div><div class="tbar">'+btn('admthx','Back','','x')+'</div>';
  return'<div class="rpdlg"><div class="who">Test hero</div><p><small>'+esc2(Object.entries(rp.s.q).map(([k,x])=>k+'='+x).join(' '))+'</small></p></div>'+
    '<div class="rpcmd">'+btn('admthlvl','Everyone +1 level')+['rats1','gate','grubb','snipe','scoutboss'].map(f=>btn('admthfight','Fight '+f,'','',{v:f})).join('')+'</div>'+
    input('adm-thf','Flag, e.g. act')+input('adm-thv','Value','number')+'<div class="rpcmd">'+btn('admthflag','Set the flag')+'</div>'+(ADM.msg?'<p class="tmsg">'+esc2(ADM.msg)+'</p>':'')+'<div class="tbar">'+btn('admthx','Back','','x')+'</div>'}

/* ---------- the player's side ---------- */
/* fixes an admin left in the save (server/admin.js): applied once, then a letter says what happened */
function adminApplyFixes(s,fixes){const done=s.fixDone=s.fixDone||[],lines=[];
  for(const f of fixes||[]){if(!f||done.includes(f.at))continue;done.push(f.at);if(done.length>100)done.shift();
    if(f.k==='unstuck'){const p=(s.w6st&&s.w6st.respawn)||'hearthspire',M=MAPS6[p];if(M){s.w6=p;s.x=M.entry[0];s.y=M.entry[1]}lines.push('We carried you back to the fountain.')}
    else if(f.k==='flag'){s.q[f.f]=f.v}
    else if(f.k==='rename'){if(s.hero)s.hero.name=f.to;const h=(s.party||[]).find(m=>m.hero)||s.party[0];if(h)h.name=f.to;lines.push('Your hero is called '+f.to+' now. '+(f.why||''))}
    else if(f.k==='gift'){const got=[];if(f.gold){s.gold+=f.gold;got.push(f.gold+' gold')}if(f.item){s.bag[f.item]=(s.bag[f.item]||0)+1;got.push('a '+f.item)}
      if(f.xp){const h=(s.party||[]).find(m=>m.hero)||s.party[0];if(h&&h.v6){h.xp=(h.xp||0)+v6XpNeed(h.lvl);while(h.lvl<30&&h.xp>=v6XpNeed(h.lvl)){h.xp-=v6XpNeed(h.lvl);v6LevelUp(h)}got.push('a level\'s XP')}}
      lines.push('Please take '+got.join(' and ')+'. '+(f.why||''))}}
  s.fix=[];return lines}
function adminLetter(lines){if(lines&&lines.length)rpSay(lines.map(t=>({who:'A letter from the keepers',text:t})))}
let pending=[];
function onServer(m){const M=me();
  switch(m.k){
    case'authok':if(m.motd)pending.push({who:'',text:'📣 '+m.motd});(m.warns||[]).forEach(w=>pending.push({who:'A warning from the keepers',text:w}));
      if(m.festival){pending.push({who:'',text:'🎉 '+m.festival.name+'! Until '+day(m.festival.until)+'.'});net.festival=m.festival}net.muteUntil=m.mute||0;break;
    case'announce':rpToast('📣 '+m.text);break;
    case'warned':rpSay([{who:'A warning from the keepers',text:m.why}]);break;
    case'muted':net.muteUntil=m.until;rpToast('You can\'t chat until '+new Date(m.until).toLocaleTimeString().slice(0,5)+'.');break;
    case'maint':try{emitSave()}catch(e){}rpToast('Saved. The server is being looked after; back soon!');break;
    case'fixed':fetchFixes();break}
  if(M&&rp.s&&pending.length){rpSay(pending);pending=[]}}
let emitSave=()=>{};
/* a fix arrives while the hero is being played: fetch the save's notes now (the next save would overwrite them otherwise) */
let fixHook=null;
function fetchFixes(){if(fixHook)fixHook()}
function adminSetHooks(save,fix){emitSave=save;fixHook=fix}
/* the game's errors, reported once each (tech-plan.md, "Before going public") */
let errN=0;const errSeen=new Set();
function adminReportError(msg,where){if(!net.online||!net.online.account.loggedIn||errN>=10)return;msg=String(msg||'').slice(0,300);if(!msg||errSeen.has(msg))return;errSeen.add(msg);errN++;
  net.online.account.send({k:'err',msg,where:String(where||'').slice(0,120),build:typeof BUILD_ID!=='undefined'?BUILD_ID:'?'})}
/* the report button (in the chat) */
async function adminReport(peer){if(!net.online||!net.online.account.loggedIn)return;try{await net.online.account.call({k:'report',peer,why:'from the chat'});rpToast('Thanks. An admin will look at it.')}catch(e){rpToast('That player is gone.')}}

feature({id:'admin-tools',
  init(){if(typeof window!=='undefined'){window.addEventListener('error',e=>adminReportError(e.message,(e.filename||'').split('/').pop()+':'+e.lineno));window.addEventListener('unhandledrejection',e=>adminReportError(e.reason&&e.reason.message||e.reason,'promise'))}
    setTimeout(()=>{if(net.online)net.online.account.onServer=onServer},0)},
  on:{'game:start':()=>{if(pending.length){rpSay(pending);pending=[]}}},
  panels:{admth:{sig:()=>JSON.stringify([rp.s&&rp.s.q,rp.s&&rp.s.party.map(m=>m.lvl),ADM.msg]),html:testHeroHtml},adm:{sig:()=>JSON.stringify([ADM.tab,ADM.d,ADM.acct,ADM.hero,ADM.msg,ADM.code,ADM.busy]),html:adminScreenHtml}},
  menu:[{order:19,html:()=>{const M=me();return M&&M.role?'<button class="rpb" type="button" data-rp="adm">Admin<small>'+(M.role==='owner'?'owner':'moderator')+' tools</small></button>':''}},
    {order:18,html:()=>rp.s&&rp.s.test?'<button class="rpb" type="button" data-rp="admth">Test hero<small>any flag, level or fight</small></button>':''}],
  actions:{
    adm:()=>{rp.mode='adm';open(ADM.tab)},admx:()=>{rp.mode='menu'},admtab:d=>open(d.v),
    admmotd:()=>act('motd',{text:v('adm-motd')},()=>call('status')),admann:()=>act('announce',{text:v('adm-ann')}),
    admmaint:d=>act('maint',{on:+d.v},()=>call('status')),admmod:d=>act('mods',{op:d.op,who:v('adm-who')},()=>call('mods')),
    admfind:()=>{ADM.acct=null;ADM.hero=null;call('find',{q:v('adm-q')})},admacct:d=>{ADM.acct=(ADM.d.find||[])[+d.v]||null;ADM.code=null},
    admhero:d=>{ADM.hero={slot:+d.v};ADM.d.hero=null;ADM.d.backups=null;call('hero',{name:ADM.acct.name,slot:+d.v})},
    admback:()=>{if(ADM.hero){ADM.hero=null;reloadAcct()}else ADM.acct=null},
    admbackups:()=>call('backups'),
    admdo:d=>{const A=ADM.acct;if(!A)return;const o={name:A.name,slot:d.slot!=null?+d.slot:undefined};
      if(d.t==='warn'||d.t==='mute'||d.t==='ban')Object.assign(o,{for:d.f});if(d.t==='undo')o.what=d.w;if(d.t==='rename'||d.t==='renamehero')o.to=v('adm-to');
      if(d.t==='delacct')o.typed=v('adm-typed');if(d.t==='flag')Object.assign(o,{flag:v('adm-flag'),v:+v('adm-fv')});if(d.t==='compensate')Object.assign(o,{gold:+v('adm-gold')||0,item:v('adm-item')||null,xp:d.xp?1:0});
      if(d.t==='restorebackup')o.day=d.day;
      act(d.t==='undo'?'undo':d.t,o,async r=>{if(d.t==='pwreset')ADM.code=r.code;if(d.t==='rename')A.name=o.to;if(ADM.hero)await call('hero',{name:A.name,slot:ADM.hero.slot});else await reloadAcct()})},
    admclose:d=>act('closereport',{id:d.id,how:d.how},()=>call('reports')),
    admword:d=>act('words',{op:d.op,word:v('adm-word')},()=>call('words')),
    admunlist:d=>act('unlist',{id:d.id},()=>call('listings')),
    admfest:d=>act('festival',d.stop?{}:{text:v('adm-fest'),days:+v('adm-days')}),
    admletters:()=>{rp.mode='admin';adminCall({op:'state'})},
    admtest:d=>act('testhero',{slot:+d.v,off:+d.off},()=>call('find',{q:me().name.toLowerCase()},'mine')),
    admth:()=>{rp.mode='admth';ADM.msg=''},admthx:()=>{rp.mode='menu'},
    admthlvl:()=>{if(!rp.s||!rp.s.test)return;rp.s.party.forEach(m=>{if(m.v6&&m.lvl<30)v6LevelUp(m)});ADM.msg='Everyone is level '+rp.s.party[0].lvl+'.'},
    admthflag:()=>{if(!rp.s||!rp.s.test)return;const f=v('adm-thf'),x=+v('adm-thv');if(/^[a-z]\w*$/.test(f)&&Number.isInteger(x)){rp.s.q[f]=x;ADM.msg=f+' = '+x}},
    admthfight:d=>{if(!rp.s||!rp.s.test)return;rp.mode='map';testFight(d.v)},
    admerrclear:()=>act('errors',{clear:1},()=>call('errors'))}});
export {ADM,TABS,act,admAgo,adminApplyFixes,adminLetter,adminReport,adminReportError,adminScreenHtml,adminSetHooks,adminSetTestFight,btn,call,day,emitSave,errN,errSeen,fetchFixes,fixHook,input,me,onServer,open,owner,pending,reloadAcct,testFight,testHeroHtml,v,why};
