/* The page's online services (room, user, db) behind one door, so the game never touches `claude` directly.
   Tests and offline play swap in another provider with platform.provider = {use(name){...}}. */
const platform={
  provider:null,
  available(){const p=this.provider||(typeof window!=='undefined'&&window.claude);return !!(p&&typeof p.use==='function')},
  use(name){const p=this.provider||window.claude;return p.use(name)}};
export {platform};
