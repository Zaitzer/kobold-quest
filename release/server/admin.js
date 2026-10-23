/* Admin tools (systems.md §17, build step 16). Every tool is checked here, written to the admin log, and never shows a password, a
   private message or a token. Roles: the owner (config.json "admins") does everything; a moderator (granted in the game by the owner,
   kept in the server's data) does the jobs marked (m) in the table. Chat is kept in memory for 24 hours only, so it never reaches
   the data file or its backups. */
const crypto=require('crypto');const {isOwner}=require('./owners.js');
const DAY=864e5,YEAR=365*DAY,KEEP=7*DAY,CHAT_KEEP=DAY,MAX_REASON=200;
const sha=t=>crypto.createHash('sha256').update(String(t)).digest('hex');
const rid=(n=4)=>crypto.randomBytes(n).toString('hex');
const clean=(t,n)=>String(t==null?'':t).replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g,' ').trim().slice(0,n||MAX_REASON);
/* who may use which tool: 'o' owner only, 'm' owner and moderators */
const TOOLS={status:'m',motd:'o',announce:'m',maint:'o',
  find:'m',hero:'m',unstuck:'m',unlock:'m',flag:'o',rename:'m',renamehero:'m',pwreset:'o',restore:'o',backups:'o',restorebackup:'o',compensate:'o',delacct:'o',
  reports:'m',closereport:'m',warn:'m',mute:'m',ban:'m',undo:'m',words:'m',chatlog:'m',
  listings:'m',unlist:'m',gifts:'o',festival:'o',testhero:'o',mods:'o',log:'m',errors:'o'};
const QUIET=new Set(['status','log','find','reports','listings','chatlog','gifts','errors','words','backups','mods']);   // views (and tools that log their own changes)   // views: not logged
const EVER=8e15;   // 'for good' (a date far ahead, so it survives JSON)
const MUTE={hour:3600e3,day:DAY,week:7*DAY},BAN={day:DAY,week:7*DAY,ever:EVER};

class Admin{
  constructor(world,store,config,opt={}){this.w=world;this.store=store;this.config=config;this.now=world.now;this.chat=[];this.gifts=[];this.dir=opt.dir||null;this.fs=opt.fs||null}
  async owner(u){return isOwner(this.store,this.config,u)}
  async mods(){return(await this.store.get('config/mods'))||[]}
  async role(u){if(!u)return null;if(await this.owner(u))return'owner';return(await this.mods()).includes(u.lname)?'mod':null}
  async log(by,tool,on,why,extra){const t=this.now();await this.store.put('adminlog/'+t.toString(36).padStart(9,'0')+rid(),Object.assign({at:t,by:by.lname,tool,on:on||null,why:clean(why)||null},extra||{}))}
  /* once on start: the year-old log lines, purged accounts and expired resets go */
  async tidy(){const t=this.now();for(const r of await this.store.list('adminlog/'))if(t-r.val.at>YEAR)await this.store.del(r.key);
    for(const r of await this.store.list('users/'))if(r.val.deletedAt&&t-r.val.deletedAt>KEEP)await this.purge(r.val);
    for(const r of await this.store.list('resets/'))if(r.val.until<t)await this.store.del(r.key)}
  async purge(u){for(const r of await this.store.list('docs/data/users/'+u.id+'/'))await this.store.del(r.key);await this.store.del('ids/'+u.id);await this.store.del('users/'+u.lname)}

  /* ---------- what the rest of the server asks ---------- */
  async canLogin(u,isNew){const t=this.now();if(u.deletedAt)return'That account was deleted.';
    if(u.ban&&u.ban.until>t)return'This account is banned'+(u.ban.until>t+50*YEAR?' for good':' until '+new Date(u.ban.until).toISOString().slice(0,10))+'. Reason: '+(u.ban.why||'none given')+'.';
    const M=await this.store.get('config/maint');if(M&&M.on&&!(await this.owner(u))&&!(await this.mods()).includes(u.lname))return'The server is being looked after. Try again in a little while.';
    return null}
  /* what a player is told at login: their role, the message of the day, the festival, warnings not yet seen */
  async greet(u){const t=this.now(),motd=await this.store.get('config/motd'),fest=await this.store.get('config/festival'),warns=(u.warns||[]).filter(w=>!w.seen);
    if(warns.length){u.warns.forEach(w=>w.seen=true);await this.store.put('users/'+u.lname,u)}
    u.seen=t;await this.store.put('users/'+u.lname,u);
    return{role:await this.role(u),motd:motd&&motd.text||null,festival:fest&&fest.until>t?fest:null,warns:warns.map(w=>w.why),mute:u.mute&&u.mute.until>t?u.mute.until:0}}
  /* world chat passes through here: muted players are told, filtered words become stars, the line is kept 24 hours in memory */
  async chatLine(conn,data){const u=await this.store.get('users/'+conn.user.lname),t=this.now();
    if(u&&u.mute&&u.mute.until>t){conn.send({k:'muted',until:u.mute.until});return null}
    const words=(await this.store.get('config/words'))||[];let txt=String(data.txt||'');
    for(const w of words)if(w)txt=txt.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),'*'.repeat(w.length));
    if(!data.to){this.chat.push({at:t,by:conn.user.name,txt});this.chat=this.chat.filter(c=>t-c.at<CHAT_KEEP)}
    return Object.assign({},data,{txt})}
  gift(conn,data,toConn){this.gifts.push({at:this.now(),from:conn.user.name,to:toConn?toConn.user.name:'?',kind:String(data.kind||''),val:String(data.val||'').slice(0,40)});if(this.gifts.length>100)this.gifts.shift()}
  /* the report button: who, about whom, the chat lines around it (from the server's own memory, not the reporter's) */
  async report(conn,m){const about=this.w.authed().find(c=>c.peer===m.peer),t=this.now();if(!about)return{ok:false,err:'that player is gone'};
    const near=this.chat.filter(c=>t-c.at<10*60e3).slice(-12);
    await this.store.put('reports/'+t.toString(36)+rid(),{at:t,by:conn.user.name,about:about.user.name,aboutL:about.user.lname,why:clean(m.why),lines:near,status:'open'});return{ok:true}}
  /* error reports from pages, grouped by message and build */
  async error(conn,m){const msg=clean(m.msg,300),build=clean(m.build,40);if(!msg)return;const k='errors/'+sha(msg+'|'+build).slice(0,20),cur=await this.store.get(k);
    if(!cur&&(await this.store.list('errors/')).length>=500)return;
    await this.store.put(k,{msg,build,where:clean(m.where,120),count:(cur?cur.count:0)+1,first:cur?cur.first:this.now(),last:this.now()})}
  /* a password reset with the one-time code an owner gave out */
  async resetPassword(m,scrypt){const lname=String(m.name||'').trim().toLowerCase(),R=await this.store.get('resets/'+lname),u=await this.store.get('users/'+lname);
    if(!R||!u||R.until<this.now()||!crypto.timingSafeEqual(Buffer.from(R.hash,'hex'),Buffer.from(sha(String(m.code||'').trim().toUpperCase()),'hex')))return'That code does not work.';
    const pass=String(m.pass||'');if(pass.length<6||pass.length>200)return'Passwords need at least 6 characters.';
    u.salt=rid(16);u.hash=await scrypt(pass,u.salt);await this.store.put('users/'+lname,u);await this.store.del('resets/'+lname);
    for(const r of await this.store.list('sessions/'))if(r.val.lname===lname)await this.store.del(r.key);return null}

  /* ---------- the tools ---------- */
  async call(conn,m){const me=conn.user,role=await this.role(me),tool=String(m.tool||'');
    if(!role)return{ok:false,err:'not an admin'};const need=TOOLS[tool];if(!need)return{ok:false,err:'unknown tool'};if(need==='o'&&role!=='owner')return{ok:false,err:'owner only'};
    const why=clean(m.why);const r=await this.run(tool,m,me,role,why);
    if(r&&r.ok&&!QUIET.has(tool))await this.log(me,tool,r.on||m.name||null,why,r.logx);
    if(r){delete r.on;delete r.logx}return r}
  async user(name){const l=String(name||'').trim().toLowerCase();return l?await this.store.get('users/'+l):null}
  heroKey(u,slot){const n=+slot;return Number.isInteger(n)&&n>=0&&n<6?'docs/data/users/'+u.id+'/char'+n:null}
  online(u){return this.w.authed().filter(c=>c.user.id===u.id)}
  tell(u,msg){for(const c of this.online(u))c.send(msg)}
  async run(tool,m,me,role,why){const t=this.now(),U=async()=>{const u=await this.user(m.name);return u};
    switch(tool){
      /* the server */
      case'status':{const keys=Object.keys(this.store.data||{});let size=0,backup=null;
        try{if(this.fs&&this.dir){size=this.fs.statSync(this.dir+'/world.json').size;backup=this.fs.readdirSync(this.dir+'/backups').sort().pop()||null}}catch(e){}
        return{ok:true,val:{build:this.w.build,up:Math.round(process.uptime()),online:this.w.authed().length,accounts:keys.filter(k=>k.startsWith('users/')).length,size,backup,
          maint:!!((await this.store.get('config/maint'))||{}).on,motd:((await this.store.get('config/motd'))||{}).text||'',role}}}
      case'motd':{const text=clean(m.text,160);if(text)await this.store.put('config/motd',{text,at:t,by:me.name});else await this.store.del('config/motd');return{ok:true,on:'everyone'}}
      case'announce':{const text=clean(m.text,160);if(!text)return{ok:false,err:'nothing to say'};this.w.broadcast({k:'announce',text});return{ok:true,on:'everyone',logx:{text}}}
      case'maint':{const on=!!m.on;await this.store.put('config/maint',{on,at:t,by:me.name});
        if(on){this.w.broadcast({k:'announce',text:'The server is being looked after. Your game saves and you will be signed out in 2 minutes.'});
          const timer=setTimeout(async()=>{const M=await this.store.get('config/maint');if(!M||!M.on)return;for(const c of this.w.authed())if(!(await this.role(c.user))){c.send({k:'maint'});c.end()}},m.now?0:120e3);if(timer.unref)timer.unref()}
        return{ok:true,on:on?'on':'off'}}
      /* players */
      case'find':{const q=String(m.q||'').trim().toLowerCase();if(q.length<2)return{ok:false,err:'type at least 2 letters'};
        const rows=(await this.store.list('users/')).filter(r=>r.val.lname.includes(q)).slice(0,20);const out=[];
        for(const r of rows){const u=r.val,heroes=[];for(let i=0;i<6;i++){const h=await this.store.get(this.heroKey(u,i));if(h)heroes.push({slot:i,name:h.hero&&h.hero.name,lvl:h.party&&h.party[0]&&h.party[0].lvl||1,deleted:!!h.deletedAt,test:!!h.test})}
          out.push({name:u.name,created:u.created||0,seen:u.seen||0,online:this.online(u).length>0,heroes,warns:(u.warns||[]).length,mute:u.mute&&u.mute.until>t?u.mute.until:0,ban:u.ban&&u.ban.until>t?(u.ban.until>t+50*YEAR?-1:u.ban.until):0,deleted:u.deletedAt||0})}
        return{ok:true,val:out}}
      case'hero':{const u=await U();const k=u&&this.heroKey(u,m.slot);const h=k&&await this.store.get(k);if(!h)return{ok:false,err:'no such hero'};
        return{ok:true,on:u.name+'#'+m.slot,val:{name:h.hero&&h.hero.name,place:h.w6||(h.place&&h.place.map)||null,x:h.x,y:h.y,respawn:h.w6st&&h.w6st.respawn,gold:h.gold,bag:h.bag||{},
          pack:(h.party||[]).map(k=>({name:k.name,cls:k.cls,lvl:k.lvl,hp:k.hp,xp:k.xp})),flags:h.q||{},saves:(h.saves||[]).slice(-20),savedAt:h.savedAt||0,test:!!h.test,deleted:h.deletedAt||0}}}
      /* the fixes below are notes in the hero's save, applied by the game when the hero is next played (so a running game never fights the server) */
      case'unstuck':case'flag':case'compensate':{const u=await U();const k=u&&this.heroKey(u,m.slot);const h=k&&await this.store.get(k);if(!h)return{ok:false,err:'no such hero'};
        const fix=h.fix=Array.isArray(h.fix)?h.fix:[];
        if(tool==='unstuck')fix.push({k:'unstuck',at:t});
        else if(tool==='flag'){const f=String(m.flag||''),v=+m.v;if(!/^[a-z][\w]{0,30}$/.test(f)||!Number.isInteger(v)||v<0||v>99)return{ok:false,err:'a flag is a name and a whole number 0 to 99'};
          const cur=(h.q||{})[f]||0;if(v<cur||v>cur+1)return{ok:false,err:'one step on only (now '+cur+')'};fix.push({k:'flag',f,v,at:t})}
        else{if(!why)return{ok:false,err:'say why (the player reads it)'};const gold=Math.max(0,Math.min(1000,+m.gold||0)|0),item=clean(m.item,40)||null,xp=m.xp?1:0;
          if(!gold&&!item&&!xp)return{ok:false,err:'give something'};fix.push({k:'gift',gold,item,xp,why,at:t})}
        await this.store.put(k,h);this.tell(u,{k:'fixed'});return{ok:true,on:u.name+'#'+m.slot,logx:tool==='flag'?{flag:m.flag,v:+m.v}:tool==='compensate'?{gold:+m.gold||0,item:m.item||null,xp:!!m.xp}:null}}
      case'unlock':{const u=await U();if(!u)return{ok:false,err:'no such account'};const n=+m.slot;if(!(n>=0&&n<6))return{ok:false,err:'which hero?'};await this.store.del('docs/data/users/'+u.id+'/lock'+n);return{ok:true,on:u.name+'#'+n}}
      case'rename':{const u=await U(),nn=String(m.to||'').trim(),nl=nn.toLowerCase();if(!u)return{ok:false,err:'no such account'};if(!this.w.nameOk(nn))return{ok:false,err:'names are 3 to 16 letters, numbers, - or _'};
        if(nl!==u.lname&&await this.store.get('users/'+nl))return{ok:false,err:'that name is taken'};const old=u.name;
        await this.store.del('users/'+u.lname);u.name=nn;const oldL=u.lname;u.lname=nl;(u.warns=u.warns||[]).push({at:t,why:'Your account was renamed from '+old+' to '+nn+'. '+(why||''),seen:false});
        await this.store.put('users/'+nl,u);await this.store.put('ids/'+u.id,{lname:nl});for(const r of await this.store.list('sessions/'))if(r.val.lname===oldL){r.val.lname=nl;await this.store.put(r.key,r.val)}
        for(const c of this.online(u)){c.user.name=nn;c.user.lname=nl}return{ok:true,on:old+' → '+nn}}
      case'renamehero':{const u=await U();const k=u&&this.heroKey(u,m.slot);const h=k&&await this.store.get(k);if(!h)return{ok:false,err:'no such hero'};const nn=String(m.to||'').trim();
        if(!/^[A-Za-zÆØÅæøåÄÖÜäöüé' -]{2,12}$/.test(nn))return{ok:false,err:'2 to 12 letters'};const old=h.hero.name;(h.fix=Array.isArray(h.fix)?h.fix:[]).push({k:'rename',to:nn,why,at:t});
        h.hero.name=nn;await this.store.put(k,h);this.tell(u,{k:'fixed'});return{ok:true,on:u.name+'#'+m.slot+' '+old+' → '+nn}}
      case'pwreset':{const u=await U();if(!u)return{ok:false,err:'no such account'};const code=rid(4).toUpperCase();await this.store.put('resets/'+u.lname,{hash:sha(code),until:t+DAY});
        return{ok:true,on:u.name,val:{code,until:t+DAY}}}   // the code is shown once to the owner; the log keeps only that a code was made
      case'restore':{const u=await U();const k=u&&this.heroKey(u,m.slot);const h=k&&await this.store.get(k);if(!h||!h.deletedAt)return{ok:false,err:'no deleted hero there'};
        if(t-h.deletedAt>KEEP)return{ok:false,err:'older than 7 days'};delete h.deletedAt;await this.store.put(k,h);return{ok:true,on:u.name+'#'+m.slot}}
      case'backups':{if(!this.fs||!this.dir)return{ok:true,val:[]};try{return{ok:true,val:this.fs.readdirSync(this.dir+'/backups').filter(f=>/^world-\d{4}-\d\d-\d\d\.json$/.test(f)).sort().reverse().slice(0,30).map(f=>f.slice(6,16))}}catch(e){return{ok:true,val:[]}}}
      case'restorebackup':{const u=await U();const k=u&&this.heroKey(u,m.slot);if(!k)return{ok:false,err:'no such account'};const day=String(m.day||'');if(!/^\d{4}-\d\d-\d\d$/.test(day)||!this.fs)return{ok:false,err:'pick a day'};
        let old;try{old=JSON.parse(this.fs.readFileSync(this.dir+'/backups/world-'+day+'.json','utf8'))[k]}catch(e){}if(!old)return{ok:false,err:'that hero is not in that backup'};
        const cur=await this.store.get(k);if(cur)await this.store.put('docs/data/users/'+u.id+'/copy'+m.slot,Object.assign({},cur,{copiedAt:t}));   // the current save is kept first
        await this.store.put(k,old);return{ok:true,on:u.name+'#'+m.slot,logx:{day}}}
      case'delacct':{const u=await U();if(!u)return{ok:false,err:'no such account'};if(String(m.typed||'').trim().toLowerCase()!==u.lname)return{ok:false,err:'type the account name'};
        if(await this.owner(u))return{ok:false,err:'not the owner'};u.deletedAt=t;await this.store.put('users/'+u.lname,u);for(const c of this.online(u)){c.send({k:'autherr',why:'This account was deleted.',stale:true});c.end()}return{ok:true,on:u.name}}
      /* moderation */
      case'reports':{const rows=(await this.store.list('reports/')).filter(r=>m.all||r.val.status==='open').slice(-50).reverse();return{ok:true,val:rows.map(r=>Object.assign({id:r.key.slice(8)},r.val,{aboutL:undefined}))}}
      case'closereport':{const k='reports/'+String(m.id||'').replace(/[^\w]/g,''),R=await this.store.get(k);if(!R)return{ok:false,err:'no such report'};const how=['none','warn','mute','ban'].includes(m.how)?m.how:'none';
        if(how!=='none'){const r=await this.run(how,{name:R.aboutL,for:m.for||(how==='mute'?'day':'day')},me,role,why||R.why||'reported');if(!r.ok)return r}
        R.status='closed';R.closed={by:me.name,how,at:t};await this.store.put(k,R);return{ok:true,on:R.about,logx:{how}}}
      case'warn':case'mute':case'ban':{const u=await U();if(!u)return{ok:false,err:'no such account'};if(await this.owner(u))return{ok:false,err:'not the owner'};if(!why)return{ok:false,err:'say why'};
        if(tool==='warn'){(u.warns=u.warns||[]).push({at:t,why,seen:false,by:me.name});this.tell(u,{k:'warned',why})}
        else if(tool==='mute'){const d=MUTE[m.for];if(!d)return{ok:false,err:'hour, day or week'};u.mute={until:t+d,why,by:me.name};this.tell(u,{k:'muted',until:u.mute.until})}
        else{const d=BAN[m.for];if(!d)return{ok:false,err:'day, week or ever'};u.ban={until:d===EVER?EVER:t+d,why,by:me.name};
          for(const c of this.online(u)){c.send({k:'autherr',why:'This account is banned. Reason: '+why+'.',stale:true});c.end()}}
        await this.store.put('users/'+u.lname,u);return{ok:true,on:u.name,logx:m.for?{for:m.for}:null}}
      case'undo':{const u=await U();if(!u)return{ok:false,err:'no such account'};const what=m.what;
        if(what==='warn')u.warns=(u.warns||[]).slice(0,-1);else if(what==='mute')delete u.mute;else if(what==='ban')delete u.ban;else return{ok:false,err:'warn, mute or ban'};
        await this.store.put('users/'+u.lname,u);return{ok:true,on:u.name,logx:{what}}}
      case'words':{let W=(await this.store.get('config/words'))||[];const w=clean(m.word,30).toLowerCase();
        if(w&&m.op==='add'&&!W.includes(w))W.push(w);if(w&&m.op==='del')W=W.filter(x=>x!==w);if(w&&m.op){await this.store.put('config/words',W);await this.log(me,'words',m.op+' '+w,null)}return{ok:true,val:W}}
      case'chatlog':{this.chat=this.chat.filter(c=>t-c.at<CHAT_KEEP);return{ok:true,val:this.chat.slice(-200)}}
      /* the market */
      case'listings':{const rows=(await this.store.list('docs/market/')).filter(r=>r.val.status==='open');const names={};
        for(const r of rows){const s=r.val.seller;if(!(s in names)){const x=await this.store.get('ids/'+s);names[s]=x?x.lname:'?'}}
        return{ok:true,val:rows.map(r=>({id:r.key.split('/').pop(),seller:names[r.val.seller],kind:r.val.kind,val:r.val.val,price:r.val.price,t:r.val.t}))}}
      case'unlist':{const id=String(m.id||'').replace(/[^\w-]/g,''),k='docs/market/'+id,L=await this.store.get(k);if(!L||L.status!=='open')return{ok:false,err:'not open'};
        L.status='removed';L.why=why||null;await this.store.put(k,L);this.w.changed('market/'+id,'market',null);return{ok:true,on:id,logx:{kind:L.kind,val:L.val}}}   // the seller's game takes it back
      case'gifts':return{ok:true,val:this.gifts.slice().reverse()};
      /* events, tests, roles, the log */
      case'festival':{const name=clean(m.text,60),days=Math.max(0,Math.min(31,+m.days||0));if(!name||!days){await this.store.del('config/festival');return{ok:true,on:'off'}}
        await this.store.put('config/festival',{name,until:t+days*DAY,stamp:'fest-'+t.toString(36)});return{ok:true,on:name,logx:{days}}}
      case'testhero':{const k=this.heroKey(me,m.slot),h=k&&await this.store.get(k);if(!h)return{ok:false,err:'one of your own heroes'};h.test=m.off?0:1;await this.store.put(k,h);return{ok:true,on:me.name+'#'+m.slot+(h.test?' test':' normal')}}
      case'mods':{let M=await this.mods();const n=String(m.who||'').trim().toLowerCase();if(n&&m.op){if(!(await this.store.get('users/'+n)))return{ok:false,err:'no such account'};
          M=M.filter(x=>x!==n);if(m.op==='add')M.push(n);await this.store.put('config/mods',M);await this.log(me,'mods',m.op+' '+n,why)}return{ok:true,val:M}}
      case'log':{let rows=(await this.store.list('adminlog/')).map(r=>r.val);if(role!=='owner')rows=rows.filter(r=>r.by===me.lname);return{ok:true,val:rows.slice(-100).reverse()}}
      case'errors':{const rows=(await this.store.list('errors/')).map(r=>r.val).sort((a,b)=>b.last-a.last).slice(0,50);if(m.clear){for(const r of await this.store.list('errors/'))await this.store.del(r.key);await this.log(me,'errors','cleared',null)}return{ok:true,val:rows}}
    }
    return{ok:false,err:'unknown tool'}}
}
module.exports={Admin,TOOLS};
