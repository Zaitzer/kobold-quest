/* The consumables a kobold can use in a fight or from the menu (items.md §7): a potion heals 35% of max HP, an ether gives back 30%
   of max mana. Gear, materials and the rest of the bag are v6 items (data/v6/items.js, game/items6.js). */
const RP_ITEMS={potion:{n:'Potion',price:15,d:'Heals 35% of max HP',t:'ally'},ether:{n:'Ether',price:25,d:'Gives back 30% of max mana',t:'ally'}};
export {RP_ITEMS};
