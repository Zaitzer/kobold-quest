/* A kobold's numbers: the v6 character sheet (game/v6sheet.js) under the names the battle code uses. */
import {CLASSES6} from '../data/v6/classes.js';
import {v6Stats} from './v6sheet.js';

function rpStats(m){return v6Stats(m)}
function rpMemSkills(m){return(m.skills||[]).slice()}   /* the four equipped skills */
function rpClsName(m){return(CLASSES6[m.cls]||{n:m.cls}).n}
function rpHat(){return'none'}
export {rpClsName,rpHat,rpMemSkills,rpStats};
