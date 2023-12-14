import assets from "./assets.js";
import { SoundManager } from "./engine/audio.js";
import { ImageManager } from "./engine/images.js";
export const images = await ImageManager.create(assets.images);
export const uiSounds = await SoundManager.create(assets.sounds);
await uiSounds.audioContext.suspend();
export const gameSounds = await SoundManager.create(assets.sounds);
await gameSounds.audioContext.suspend();
const ASPECT_RATIO = 4 / 3;
export const canvas = document.getElementById("game");
canvas.tabIndex = 0;
canvas.width = 640;
canvas.height = canvas.width / ASPECT_RATIO;
export const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
export const keys = Object.create(null);
canvas.addEventListener("keydown", e => keys[e.key] = { justPressed: true });
canvas.addEventListener("keyup", e => delete keys[e.key]);
const userGestureEvents = ["keydown", "mousedown", "pointerup"];
const startAudioContexts = () => {
    void uiSounds.audioContext.resume();
    void gameSounds.audioContext.resume();
    userGestureEvents.forEach(name => { canvas.removeEventListener(name, startAudioContexts); });
};
userGestureEvents.forEach(name => { canvas.addEventListener(name, startAudioContexts); });
//# sourceMappingURL=global.js.map