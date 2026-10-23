/* Who owns the server: the account names in config.json "admins", pinned to the account that first held each name. The pin
   (owners/<name> in the store) means a deleted or renamed owner account can't be taken over by someone who registers the free name:
   only the pinned account is the owner, and the name stays reserved (world.js refuses to register it). */
const names=config=>(config.admins||[]).map(s=>String(s).toLowerCase());
async function isOwner(store,config,user){if(!user||!names(config).includes(user.lname))return false;
  const pin=await store.get('owners/'+user.lname);if(!pin){await store.put('owners/'+user.lname,{id:user.id});return true}
  return pin.id===user.id}
/* a name nobody may register: an owner's name that is pinned to an account */
async function reserved(store,config,lname){return names(config).includes(lname)&&!!(await store.get('owners/'+lname))}
module.exports={isOwner,reserved};
