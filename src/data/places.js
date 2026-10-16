/* Rooms you can walk into. Each is drawn as rows of letters, one letter per tile:
     w wall   f floor   r rug   l stool   e the way out (stand on it to leave)
     t table  k counter s shelf o barrel  p bed  h hearth  x cauldron  y plant     (these block the way)
   A door on the world map (tile d) leads into the room listed for its position in RP_DOORS.
   You arrive standing just inside the way out; leaving puts you one step south of the door outside.
   NPCs, chests and quest spots say which room they are in with place:'inn' (no place = outdoors). */
const RP_PLACES={
  inn:{name:'The Snoring Snail',rows:[
    'wwwwwwwwwwwww',
    'whfffsssfffow',
    'wfffkkkkkfffw',
    'wffffffffffow',
    'wltlffffltlfw',
    'wffffffffffyw',
    'wffrrrrrrrffw',
    'wffffffffffyw',
    'wwwwwwewwwwww']},
  shop:{name:'Biscuit\'s Goods',rows:[
    'wwwwwwwwwww',
    'wsssssssssw',
    'wffffffffow',
    'wfkkkkkfffw',
    'wffffffffow',
    'wofffffffyw',
    'wfffrrrfffw',
    'wwwwwewwwww']},
  elder:{name:'Elder Mumble\'s house',rows:[
    'wwwwwwwwwww',
    'wpfsssffpfw',
    'wpffffffpfw',
    'wffftffffhw',
    'wfffflffffw',
    'wfrrrrrrffw',
    'wyfffffffyw',
    'wwwwwewwwww']},
  hut:{name:'Witch Yarrow\'s hut',rows:[
    'wwwwwwwwwww',
    'wssfffffssw',
    'wfffxffffyw',
    'wfffffffffw',
    'wyffrrrfffw',
    'wsffrrrffow',
    'wfffffffffw',
    'wwwwwewwwww']}
};
/* door position on the world map → room */
const RP_DOORS={'3,20':'inn','11,20':'shop','4,26':'elder','8,4':'hut'};
const RP_ROOM_SOLID=['w','t','k','s','o','p','h','x','y'];
export {RP_DOORS,RP_PLACES,RP_ROOM_SOLID};
