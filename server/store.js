/* Storage for the world: one JSON file, kept in memory, written to disk at most twice a second
   (write to a temp file, then rename, so a crash never leaves half a file). Daily copies in backups/. */
const fs=require('fs'),path=require('path');
class FileStore{
  constructor(dir){this.dir=dir;fs.mkdirSync(path.join(dir,'backups'),{recursive:true});this.file=path.join(dir,'world.json');
    this.data=fs.existsSync(this.file)?JSON.parse(fs.readFileSync(this.file,'utf8')):{};this.timer=null}
  async get(k){const v=this.data[k];return v===undefined?null:JSON.parse(JSON.stringify(v))}
  async put(k,v){this.data[k]=JSON.parse(JSON.stringify(v));this.dirty()}
  async del(k){delete this.data[k];this.dirty()}
  async list(prefix){return Object.keys(this.data).filter(k=>k.startsWith(prefix)).sort().map(key=>({key,val:JSON.parse(JSON.stringify(this.data[key]))}))}
  dirty(){if(!this.timer)this.timer=setTimeout(()=>this.flush(),500)}
  flush(){clearTimeout(this.timer);this.timer=null;const tmp=this.file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(this.data));fs.renameSync(tmp,this.file);
    const day=new Date().toISOString().slice(0,10),b=path.join(this.dir,'backups','world-'+day+'.json');if(!fs.existsSync(b))fs.copyFileSync(this.file,b)}
}
module.exports={FileStore};
