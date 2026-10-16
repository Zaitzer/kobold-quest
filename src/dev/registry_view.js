/* test builds: a read-only view of what features registered, for tests that check wiring */
import {FLAGS,actions,features,frames,inits,menuItems,netHandlers,options,panels,routes,tiles} from '../core/registry.js';

const registry={panels,actions,routes,tiles,netHandlers,menuItems,options,frames,inits,features,FLAGS};
export {registry};
