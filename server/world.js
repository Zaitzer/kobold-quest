/* The one shared world. Transport-free: main.js feeds it connections and messages.
   - accounts: username + password (scrypt hash with salt), login tokens (only their hash is stored)
   - the room: who is online, their presence, game messages relayed between players
   - the database: private saves under data/users/<id>/..., the shared market, short leases against double-buys */
const crypto=require('crypto');const {reserved}=require('./owners.js');

const NAME_RE=/^[\p{L}\p{N}_-]{3,16}$/u;
const MAX_MSG=4096,MAX_DOC=64*1024,MAX_MARKET_DOC=2048,SESSION_DAYS=180,MAX_LISTINGS=20;
/* how fast one connection may talk: [per second, burst]. Anything faster is dropped, so one player (or a script) can't flood the
   others or the server. Generous for play: a co-op fight sends a few messages a second, chat a line now and then. */
const RATE={all:[30,120],emit:[15,60],pres:[10,30],chat:[1,5]};
/* the documents a player's page may keep under data/users/<id>/: a hero per slot and its one-device lock (ui/chars6.js) */
const PRIVATE_DOC=/^(char|lock)[0-5]$/;
const scrypt=(pass,salt)=>new Promise((ok,no)=>crypto.scrypt(pass,salt,32,{N:16384,r:8,p:1},(e,k)=>e?no(e):ok(k.toString('hex'))));
const sha=t=>crypto.createHash('sha256').update(t).digest('hex');
const rid=(n=8)=>crypto.randomBytes(n).toString('hex');

class World{
  constructor(store,opt={}){this.store=store;this.conns=new Set();this.leases=new Map();this.tries=new Map();this.now=opt.now||(()=>Date.now());this.build=opt.build||'dev';this.mail=opt.mail||null;this.admin=null;this.opt=opt}
  nameOk(n){return NAME_RE.test(String(n||''))}

  /* public numbers for /status (no names) */
  stats(){const keys=Object.keys(this.store.data||{});return{accounts:keys.filter(k=>k.startsWith('users/')).length,listings:keys.filter(k=>k.startsWith('docs/market/')).length}}
  /* ---------- connections ---------- */
  open(conn){conn.peer='p_'+rid(5);conn.user=null;conn.presence={};conn.buckets=this.opt.rate?{}:null;this.conns.add(conn)}   // rate limits: on in the real server (main.js), off in tests that replay fast
  /* a token bucket per connection and kind: true when the message may pass */
  allow(conn,kind){const [per,burst]=RATE[kind],t=this.now()/1000,b=conn.buckets[kind]||(conn.buckets[kind]={n:burst,t});
    b.n=Math.min(burst,b.n+(t-b.t)*per);b.t=t;if(b.n<1)return false;b.n-=1;return true}
  close(conn){if(!this.conns.delete(conn))return;if(conn.user)this.broadcast({k:'gone',peer:conn.peer},conn)}
  authed(){return[...this.conns].filter(c=>c.user)}
  broadcast(msg,except){const s=JSON.stringify(msg);for(const c of this.authed())if(c!==except)c.sendRaw(s)}
  peerOf(c){return{peer:c.peer,by:c.user.id,presence:c.presence}}

  async message(conn,raw){
    if(typeof raw!=='string'||raw.length>MAX_DOC+1024)return conn.send({k:'err',why:'too big'});
    if(conn.buckets&&!this.allow(conn,'all'))return;
    let m;try{m=JSON.parse(raw)}catch(e){return}
    if(!m||typeof m!=='object')return;
    try{
      if(m.k==='register'||m.k==='login'||m.k==='resume')return await this.auth(conn,m);
      if(m.k==='resetpw'&&this.admin){if(this.limited(conn))return conn.send({k:'autherr',why:'Too many tries. Wait a few minutes.'});const bad=await this.admin.resetPassword(m,scrypt);
        return conn.send(bad?{k:'autherr',why:bad}:{k:'pwdone'})}
      if(!conn.user)return conn.send({k:'autherr',why:'Please log in.'});
      switch(m.k){
        case 'logout':await this.store.del('sessions/'+sha(String(m.token||'')));conn.send({k:'loggedout'});return conn.end();
        case 'pres':return this.presence(conn,m.presence);
        case 'emit':return await this.emit(conn,m);
        case 'profiles':return conn.send({k:'res',rid:m.rid,val:await this.profiles(m.ids)});
        case 'db':return conn.send(Object.assign({k:'res',rid:m.rid},await this.db(conn,m)));
        case 'ping':return conn.send({k:'pong'});
        case 'mail':return conn.send(Object.assign({k:'res',rid:m.rid},this.mail?await this.mail.send(conn.user,m.text,m.where):{ok:false,err:'no messenger'}));
        case 'mailcheck':return conn.send({k:'res',rid:m.rid,ok:true,val:{canMail:this.mail?await this.mail.canSend(conn.user):false}});
        case 'adm':return conn.send(Object.assign({k:'res',rid:m.rid},this.admin?await this.admin.call(conn,m):{ok:false,err:'no admin tools'}));
        case 'report':return conn.send(Object.assign({k:'res',rid:m.rid},this.admin?await this.admin.report(conn,m):{ok:false}));
        case 'err':if(this.admin)await this.admin.error(conn,m);return;
        case 'admin':return conn.send(Object.assign({k:'res',rid:m.rid},this.mail?await this.mail.admin(conn.user,m):{ok:false,err:'no messenger'}));
      }
    }catch(e){console.error('message',m&&m.k,e);if(m&&m.rid)conn.send({k:'res',rid:m.rid,ok:false,err:'server error'})}
  }

  /* ---------- accounts ---------- */
  limited(conn){const key=conn.ip||'?',t=this.now(),a=(this.tries.get(key)||[]).filter(x=>t-x<10*60e3);a.push(t);this.tries.set(key,a);return a.length>20}
  async auth(conn,m){
    if(m.k==='resume'){const s=await this.store.get('sessions/'+sha(String(m.token||'')));
      if(!s||s.until<this.now())return conn.send({k:'autherr',why:'Your login ran out. Please log in again.',stale:true});
      const u=await this.store.get('users/'+s.lname);if(!u)return conn.send({k:'autherr',why:'That account is gone.',stale:true});
      {const no=this.admin&&await this.admin.canLogin(u);if(no)return conn.send({k:'autherr',why:no,stale:true})}
      return this.welcome(conn,u,null)}
    if(this.limited(conn))return conn.send({k:'autherr',why:'Too many tries. Wait a few minutes.'});
    const name=String(m.name||'').trim(),pass=String(m.pass||'');
    if(!NAME_RE.test(name))return conn.send({k:'autherr',why:'Names are 3 to 16 letters, numbers, - or _.'});
    if(pass.length<6||pass.length>200)return conn.send({k:'autherr',why:'Passwords need at least 6 characters.'});
    const lname=name.toLowerCase();let u=await this.store.get('users/'+lname);
    if(m.k==='register'){
      if(u||await reserved(this.store,this.opt.config||{},lname))return conn.send({k:'autherr',why:'That name is taken.'});
      {const M=await this.store.get('config/maint');if(M&&M.on)return conn.send({k:'autherr',why:'The server is being looked after. Try again in a little while.'})}
      const salt=rid(16);u={id:'u_'+rid(6),name,lname,salt,hash:await scrypt(pass,salt),created:this.now()};
      await this.store.put('users/'+lname,u);await this.store.put('ids/'+u.id,{lname})}
    else{
      const bad=()=>conn.send({k:'autherr',why:'Wrong name or password.'});
      if(!u){await scrypt(pass,'x'.repeat(32));return bad()}
      const h=await scrypt(pass,u.salt);if(!crypto.timingSafeEqual(Buffer.from(h,'hex'),Buffer.from(u.hash,'hex')))return bad();
      {const no=this.admin&&await this.admin.canLogin(u);if(no)return conn.send({k:'autherr',why:no})}}
    const token=rid(24);await this.store.put('sessions/'+sha(token),{lname,until:this.now()+SESSION_DAYS*864e5});
    return this.welcome(conn,u,token)}
  async welcome(conn,u,token){
    conn.user={id:u.id,name:u.name,lname:u.lname};const canMail=this.mail?await this.mail.canSend(conn.user):false,G=this.admin?await this.admin.greet(u):{},admin=!!(G.role||(this.mail&&await this.mail.isAdmin(conn.user)));
    conn.send({k:'authok',id:u.id,name:u.name,token,build:this.build,canMail,admin,role:G.role||null,motd:G.motd||null,festival:G.festival||null,warns:G.warns||[],mute:G.mute||0,peer:conn.peer,peers:this.authed().filter(c=>c!==conn).map(c=>this.peerOf(c))});
    this.broadcast({k:'pres',...this.peerOf(conn)},conn)}
  async profiles(ids){const out={};for(const id of [].concat(ids||[]).slice(0,50)){const r=await this.store.get('ids/'+id);const u=r&&await this.store.get('users/'+r.lname);if(u)out[id]={id,name:u.name}}return out}

  /* ---------- the room ---------- */
  presence(conn,p){if(!p||typeof p!=='object'||JSON.stringify(p).length>MAX_MSG)return;if(conn.buckets&&!this.allow(conn,'pres'))return;
    const next=Object.assign({},conn.presence,p);for(const k in next)if(next[k]===null)delete next[k];conn.presence=next;
    this.broadcast({k:'pres',...this.peerOf(conn)},conn)}
  async emit(conn,m){let data=m.data;const s=JSON.stringify(data);if(!s||s.length>MAX_MSG)return;
    if(conn.buckets&&(!this.allow(conn,'emit')||(data&&data.t==='chat'&&!this.allow(conn,'chat'))))return;
    if(this.admin&&data&&data.t==='chat'){data=await this.admin.chatLine(conn,data);if(!data)return}
    if(this.admin&&data&&data.t==='gift')this.admin.gift(conn,data,this.authed().find(c=>c.peer===data.to));
    const msg=JSON.stringify({k:'emit',topic:String(m.topic||''),data,peer:conn.peer,by:conn.user.id});
    for(const c of this.authed())if(c!==conn&&(!data||!data.to||data.to===c.peer))c.sendRaw(msg)}

  /* ---------- the database ---------- */
  /* who may touch a path: your own saves, and the shared market */
  access(conn,path){const p=String(path||'').split('/');
    if(p.some(x=>!x||x.length>80||!/^[\w.-]+$/.test(x)))return null;
    if(p[0]==='data'&&p[1]==='users'&&p[2]===conn.user.id&&p.length===4&&PRIVATE_DOC.test(p[3]))return'private';
    if(p[0]==='market'&&p.length<=2)return'market';
    return null}
  async db(conn,m){const kind=this.access(conn,m.path);if(!kind)return{ok:false,err:'not allowed'};
    const me=conn.user.id,path=m.path,docPath=path.split('/').length%2===0;
    switch(m.op){
      case 'get':if(!docPath)return{ok:false,err:'not a document'};return{ok:true,val:await this.store.get('docs/'+path)};
      case 'col':{if(docPath)return{ok:false,err:'not a collection'};const rows=await this.store.list('docs/'+path+'/');
        const w=Array.isArray(m.where)?m.where:[];
        return{ok:true,val:rows.filter(r=>!r.key.slice(('docs/'+path+'/').length).includes('/')&&w.every(([f,op,v])=>op!=='=='||r.val[f]===v)).map(r=>({id:r.key.split('/').pop(),data:r.val}))}}
      case 'set':case 'upd':{if(!docPath)return{ok:false,err:'not a document'};const data=m.data;
        if(!data||typeof data!=='object'||Array.isArray(data))return{ok:false,err:'bad data'};
        const size=JSON.stringify(data).length;if(size>(kind==='market'?MAX_MARKET_DOC:MAX_DOC))return{ok:false,err:'too big'};
        const cur=await this.store.get('docs/'+path);
        if(m.op==='upd'&&!cur)return{ok:false,err:'missing'};
        if(kind==='market'){const bad=this.marketRule(me,cur,data,m.op);if(bad)return{ok:false,err:bad}
          if(!cur&&(await this.store.list('docs/market/')).filter(r=>r.val.seller===me).length>=MAX_LISTINGS)return{ok:false,err:'too many listings'}}
        const val=m.op==='upd'?Object.assign({},cur,data):data;
        await this.store.put('docs/'+path,val);this.changed(path,kind,me);return{ok:true}}
      case 'del':{if(!docPath)return{ok:false,err:'not a document'};const cur=await this.store.get('docs/'+path);
        if(kind==='market'&&cur&&cur.seller!==me)return{ok:false,err:'not yours'};
        await this.store.del('docs/'+path);this.changed(path,kind,me);return{ok:true}}
      case 'acq':{const t=this.now(),L=this.leases.get(path);if(L&&L.until>t&&L.holder!==me)return{ok:true,val:{acquired:false}};
        this.leases.set(path,{holder:me,until:t+Math.min(60000,Math.max(1000,+m.ttl||30000))});return{ok:true,val:{acquired:true}}}
    }
    return{ok:false,err:'unknown op'}}
  /* market: you list things as yourself; anyone may buy an open listing for themselves; only the seller cancels */
  marketRule(me,cur,data,op){
    if(op==='set'&&!cur)return data.seller===me&&data.status==='open'?null:'list as yourself';
    if(!cur)return'missing';
    if(cur.seller===me)return data.seller&&data.seller!==me?'not yours':null;
    const keys=Object.keys(data);
    if(op==='upd'&&cur.status==='open'&&data.status==='sold'&&data.buyer===me&&keys.every(k=>['status','buyer','soldAt'].includes(k)))return null;
    return'not yours'}
  changed(path,kind,me){const msg=JSON.stringify({k:'dbchg',path});
    for(const c of this.authed())if(kind==='market'||c.user.id===me)c.sendRaw(msg)}
}
module.exports={World,NAME_RE};
