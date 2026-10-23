/* Saving: the hero being played saves into its slot (ui/chars6.js listens for 'save6'; the format is core/save6.js). */
import {emit} from './bus.js';
import {rp} from './state.js';

function rpSave(){if(rp.headless||!rp.s||!rp.s.w6)return;emit('save6',rp.s)}
export {rpSave};
