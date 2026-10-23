/* The game's online services (room, user, db) behind one door. The website sets the provider to the game server's link
   (adapters/online.js, on login); the test build uses the mock server tests put on window.__kqMock (test/browser/netmock.js). */
const platform={
  provider:null,
  get(){return this.provider||(typeof TEST!=='undefined'&&TEST&&typeof window!=='undefined'&&window.__kqMock)||null},
  available(){const p=this.get();return !!(p&&typeof p.use==='function')},
  use(name){return this.get().use(name)}};
export {platform};
