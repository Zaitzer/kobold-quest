/* Loads the whole game in Node, without a browser: every module's exports in one object.
   The DOM is a stub, drawing goes to a no-op canvas. Used by the logic tests and the balance sims. */
const fs=require('fs'),path=require('path'),esbuild=require('esbuild');
const SRC=path.join(__dirname,'../../src');
function stubs(){
  const ctxProxy=()=>new Proxy(function(){},{get:(t,p)=>p==='createRadialGradient'||p==='createLinearGradient'?()=>({addColorStop(){}}):p==='measureText'?()=>({width:10}):ctxProxy(),set:()=>true,apply:()=>ctxProxy()});
  const byId={};
  const mkEl=id=>({id,listeners:{},children:[],style:{setProperty(){}},classList:{toggle(){},add(){},remove(){},contains:()=>false},dataset:{},
    append(...a){a.forEach(x=>this.children.push(x));this.lastChild=a[a.length-1]},addEventListener(t,f){this.listeners[t]=f},removeEventListener(){},setAttribute(){},getAttribute:()=>null,
    querySelectorAll:()=>[],querySelector:()=>null,closest:()=>null,getBoundingClientRect:()=>({width:844,height:390,left:0,top:0,right:844,bottom:390}),
    getContext:()=>ctxProxy(),width:0,height:0,clientWidth:844,clientHeight:390,hidden:false,disabled:false,textContent:'',innerHTML:'',value:'',contains:()=>false,focus(){},
    parentElement:{getBoundingClientRect:()=>({width:844,height:390})}});
  global.document={addEventListener(){},getElementById:id=>byId[id]||(byId[id]=mkEl(id)),createElement:()=>mkEl(),createTextNode:()=>({}),querySelectorAll:()=>[],querySelector:()=>null,
    elementFromPoint:()=>null,documentElement:mkEl('html'),activeElement:null,fullscreenElement:null,hidden:false};
  global.window={devicePixelRatio:1,matchMedia:()=>({matches:false}),addEventListener(){},scrollTo(){}};
  const store={};global.localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}};
  global.sessionStorage={getItem:()=>'1',setItem(){}};global.window.localStorage=global.localStorage;global.innerWidth=844;global.innerHeight=390;
  global.requestAnimationFrame=()=>0;global.performance={now:()=>Date.now()};
  try{Object.defineProperty(global,'navigator',{value:{vibrate(){}},configurable:true})}catch(e){}
}
let cache=null;
module.exports=function load(){
  if(cache)return cache;
  const files=[];(function scan(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())scan(p);else if(f.endsWith('.js')&&!/^(main|systems)\.js$/.test(f)&&!p.includes(path.sep+'dev'+path.sep))files.push(p)}})(SRC);
  const entry=files.map(f=>"export * from '"+f.replace(/\\/g,'/')+"';").join('\n')+"\nimport {inits} from '"+SRC.replace(/\\/g,'/')+"/core/registry.js';export function __init(){for(const f of inits)f()}\n";
  const code=esbuild.buildSync({stdin:{contents:entry,resolveDir:SRC},bundle:true,format:'cjs',platform:'neutral',write:false,define:{TEST:'false'},logLevel:'error'}).outputFiles[0].text;
  stubs();const m={exports:{}};new Function('module','exports',code)(m,m.exports);
  cache=m.exports;cache.__init();cache.rp.headless=true;return cache;
};
