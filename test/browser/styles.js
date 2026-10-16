/* Computed-style snapshot of every screen at three sizes. `node styles.js save base.json` then, after a CSS change,
   `node styles.js compare base.json` lists every element whose box or look changed. Used to refactor CSS safely. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const FILE='file://'+path.join(__dirname,'../../dist/kq_test.html');
const SAVE=fs.readFileSync(path.join(__dirname,'../fixtures/save_v2.json'),'utf8');
const VPS=[{n:'land',width:844,height:390},{n:'port',width:390,height:844},{n:'desk',width:1280,height:800}];
const PROPS=['display','position','top','left','right','bottom','width','height','min-width','max-width','min-height','max-height','visibility','opacity','color','background-color','background-image','font-size','font-weight','font-family','font-style','line-height','letter-spacing','text-transform','text-align','text-shadow','text-decoration-line','white-space','overflow-x','overflow-y','text-overflow','border-top-width','border-right-width','border-bottom-width','border-left-width','border-top-color','border-bottom-color','border-top-style','border-top-left-radius','border-bottom-right-radius','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left','box-shadow','transform','z-index','flex-direction','flex-wrap','flex-grow','flex-shrink','flex-basis','justify-content','align-items','align-self','align-content','gap','row-gap','grid-template-columns','order','pointer-events','cursor','filter','backdrop-filter','outline-style','animation-name','touch-action','user-select','box-sizing','aspect-ratio','object-fit','vertical-align','list-style-type','content','inset','transition-duration','-webkit-text-stroke-width'];
const STATES=require('./states.js');
async function snap(){const br=await chromium.launch();const out={};
  for(const vp of VPS){const ctx=await br.newContext({viewport:{width:vp.width,height:vp.height},hasTouch:true,isMobile:vp.n!=='desk',deviceScaleFactor:1});const p=await ctx.newPage();p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load/.test(m.text()))console.log('page error:',m.text().slice(0,200))});p.on('pageerror',e=>console.log('page error:',e.message));
    await p.addInitScript(s=>{try{localStorage.setItem('kobold-pit-rpg',s);sessionStorage.setItem('kobold-pit-booted','1');Math.random=(()=>{let x=9;return()=>{x=(x*48271)%2147483647;return x/2147483647}})()}catch(e){}},SAVE);
    await p.goto(FILE);await p.waitForTimeout(300);
    for(const [name,fn] of Object.entries(STATES)){await fn(p);if(vp.n==='land')await p.screenshot({path:path.join(__dirname,'../out/st_'+name+'.png')});
      out[vp.n+'|'+name]=await p.evaluate(PROPS=>{const res={};const walk=(el,pathS)=>{const kids=[...el.children];kids.forEach((c,i)=>{if(c.tagName==='SCRIPT'||c.tagName==='STYLE')return;const key=pathS+'/'+c.tagName.toLowerCase()+(c.id?'#'+c.id:'')+(c.className&&typeof c.className==='string'?'.'+c.className.trim().split(/\s+/).join('.'):'')+'['+i+']';
        const cs=getComputedStyle(c),r=c.getBoundingClientRect();if(cs.display==='none'){res[key]='none';return}
        res[key]=[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)].join(',')+' '+PROPS.map(q=>cs.getPropertyValue(q)).join('|');walk(c,key)})};walk(document.body,'');return res},PROPS)}
    await ctx.close()}
  await br.close();return out}
(async()=>{const [cmd,file]=process.argv.slice(2);const cur=await snap();
  if(cmd==='save'){fs.writeFileSync(file,JSON.stringify(cur));console.log('saved',Object.keys(cur).length,'screens,',Object.values(cur).reduce((a,o)=>a+Object.keys(o).length,0),'elements')}
  else{const base=JSON.parse(fs.readFileSync(file,'utf8'));let n=0;
    for(const s in base){const A=base[s],B=cur[s]||{};for(const k of new Set([...Object.keys(A),...Object.keys(B)]))if(A[k]!==B[k]){n++;if(n<=25)console.log(s,k.split('/').slice(-2).join('/'),'\n   was',String(A[k]).slice(0,200),'\n   now',String(B[k]).slice(0,200))}}
    console.log(n?'FAIL':'ok','style differences:',n);process.exitCode=n?1:0}})();
