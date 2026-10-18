/* Campfire chats at the inns: two party members talking, unlocked by travelling together (won fights with both in the
   party). Opinions come out as friends arguing, never as speeches (story bible: how the party carries the story).
   a, b: the two (by name) · need: fights won together (default 3) · if: extra quest condition · lines: {who,text} */
const BANTER=[
  {id:'bork_wizzle',a:'Bork',b:'Wizzle',lines:[
    {who:'Wizzle',text:'Bork, what did you do on hatching night?'},
    {who:'Bork',text:'Bork had an ember. Bork put it under his pillow to keep his feet warm. Bork slept very well.'},
    {who:'Wizzle',text:'You had an EMBER and you SLEPT on it?!'},
    {who:'Bork',text:'Next time Bork will not nap.'},
    {who:'Wizzle',text:'Can I have yours next time? In case you nap?'},
    {who:'Bork',text:'No. It is Bork\'s ember.'}]},
  {id:'fennel_nugget',a:'Fennel',b:'Nugget',lines:[
    {who:'Nugget',text:'Want a nugget? They\'re not for eating. I just like giving them to people.'},
    {who:'Fennel',text:'I\'ll trade you a carrot. It\'s for eating. Mostly. It has opinions.'},
    {who:'Nugget',text:'This is the best trade of my whole life.'},
    {who:'Nugget',text:'Grandad lost his lucky nugget in the pass when I was little. Shaped like a duck. I always look.'},
    {who:'Fennel',text:'Then we\'ll all look. Parsnip is very good at finding things. Mostly hats.'}]},
  {id:'pip_wizzle',a:'Pip',b:'Wizzle',if:{pb:{gte:3}},lines:[
    {who:'Wizzle',text:'Pip? Can I see it? Your ember?'},
    {who:'Pip',text:'...It\'s just an ember.'},
    {who:'Wizzle',text:'It\'s still warm! You\'ve carried it all this way?'},
    {who:'Pip',text:'Pockets are cold.'},
    {who:'Wizzle',text:'Right. Pockets.'}]},
  {id:'bork_fennel',a:'Bork',b:'Fennel',lines:[
    {who:'Fennel',text:'Our sleepy-egg club meets on Tuesdays. We nap.'},
    {who:'Bork',text:'Bork would like to join this club.'},
    {who:'Fennel',text:'You\'d have to warm the sleepy egg at the next hatching. That\'s the only rule.'},
    {who:'Bork',text:'Bork will think about it.'},
    {who:'Bork',text:'...While napping.'}]},
  {id:'nugget_pip',a:'Nugget',b:'Pip',lines:[
    {who:'Nugget',text:'Why is the sky up? Why are eggs round? Why do goats eat hats?'},
    {who:'Pip',text:'Why do you ask so many questions?'},
    {who:'Nugget',text:'How else do you find stuff out?'},
    {who:'Pip',text:'...Fair.'}]}];
const bondKey=(a,b)=>[a,b].sort().join('|');
/* the next chat this party can have, or null */
function banterNext(s,test){const names=s.party.map(m=>m.name),seen=s.banter||[],bond=s.bond||{};
  return BANTER.find(B=>!seen.includes(B.id)&&names.includes(B.a)&&names.includes(B.b)&&(bond[bondKey(B.a,B.b)]||0)>=(B.need||3)&&(!B.if||!test||test(B.if)))||null}
export {BANTER,banterNext,bondKey};
