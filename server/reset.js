/* Progress resets. When "epoch" in config.json is higher than the world's, the server clears every player's cloud saves (old save, v6 heroes, locks)
   and the market once, on start. Accounts, logins, letters and the admin list stay. The pages ignore saves from an
   older epoch too (SAVE_EPOCH in src/core/save.js), so copies kept in browsers don't come back. Daily backups
   (data/backups) keep the old world in case it's needed. */
async function resetWorld(store,epoch){const cur=(await store.get('meta/epoch'))||0;if(!epoch||epoch<=cur)return null;
  let market=0,saves=0;
  for(const r of await store.list('docs/market/')){await store.del(r.key);market++}
  for(const r of await store.list('docs/data/users/'))if(/\/(save|char\d+|lock\d+|legacy|account)$/.test(r.key)){await store.del(r.key);saves++}
  await store.put('meta/epoch',epoch);return{epoch,market,saves}}
module.exports={resetWorld};
