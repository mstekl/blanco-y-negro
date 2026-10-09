// PencilSkins.js — All the skins that come out of the pencils, in ONE list:
// the 30 of SkinPack.js plus the 50 of SkinPack2.js.
// The rest of the game (Hero, skins screen, pencils) only looks at this list.

import { SKIN_PACK } from './SkinPack.js';
import { SKIN_PACK_2 } from './SkinPack2.js';

export const PENCIL_SKINS = [...SKIN_PACK, ...SKIN_PACK_2];
