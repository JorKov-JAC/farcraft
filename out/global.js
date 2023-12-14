import assets from "./assets.js";
import { SoundManager } from "./engine/audio.js";
import { ImageManager } from "./engine/images.js";
const aspectRatio = 4 / 3;
export const canvas = document.getElementById("game");
canvas.width = 640;
canvas.height = canvas.width / aspectRatio;
export const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
export const images = await ImageManager.create(assets.images);
export const uiSounds = await SoundManager.create(assets.sounds);
export const gameSounds = await SoundManager.create(assets.sounds);
//# sourceMappingURL=global.js.map