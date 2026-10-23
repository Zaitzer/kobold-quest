/* Kobold Quest entry. Importing boot pulls in every system; each system registers itself
   with feature({...}) as it loads, then boot() runs their init()s and starts the loop. */
import {boot} from './app/boot.js';
import './systems.js';
boot();
