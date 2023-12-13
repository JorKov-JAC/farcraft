import assets from "./assets.js";
import { SoundManager } from "./engine/audio.js";
import { ImageManager } from "./engine/images.js";
export const images = await ImageManager.create(assets.images);
export const uiSounds = await SoundManager.create(assets.sounds);
export const gameSounds = await SoundManager.create(assets.sounds);
//# sourceMappingURL=global.js.map