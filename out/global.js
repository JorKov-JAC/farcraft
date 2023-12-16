import assets from "./assets.js";
import { canvas } from "./context.js";
import { SoundManager } from "./engine/audio.js";
import { ImageManager } from "./engine/images.js";
import { GameMouseEvent } from "./engine/ui/GameMouseEvent.js";
import UiTree from "./engine/ui/UiTree.js";
import { v2 } from "./engine/vector.js";
export let mousePos = v2(canvas.width / 2, canvas.height / 2);
export let captureInput = false;
const techFont = new FontFace("tech", "url(assets/fonts/orbitron.ttf)");
await techFont.load();
document.fonts.add(techFont);
export const images = await ImageManager.create(assets.images);
export const uiSounds = await SoundManager.create(assets.sounds);
await uiSounds.audioContext.suspend();
export const gameSounds = await SoundManager.create(assets.sounds);
await gameSounds.audioContext.suspend();
export const ui = new UiTree();
export const keys = Object.create(null);
canvas.addEventListener("keydown", e => {
    if (captureInput) {
        keys[e.key] = { justPressed: true };
        e.preventDefault();
        e.stopPropagation();
    }
    else if (e.key === "Enter" || e.key === " ")
        canvas.requestPointerLock();
});
canvas.addEventListener("keyup", e => {
    if (captureInput) {
        delete keys[e.key];
        e.preventDefault();
        e.stopPropagation();
    }
});
document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === canvas) {
        captureInput = true;
        canvas.focus();
    }
    else {
        captureInput = false;
        for (const key in keys) {
            delete keys[key];
        }
    }
});
canvas.addEventListener("mousedown", e => {
    if (captureInput)
        e.preventDefault();
    if (e.button >= 3)
        return;
    e.preventDefault();
    let pos;
    if (!captureInput) {
        canvas.requestPointerLock();
        pos = v2(e.offsetX, e.offsetY);
    }
    else {
        pos = mousePos.slice();
    }
    ui.addMouseEvent(new GameMouseEvent(0, e.button, pos));
});
canvas.addEventListener("mouseup", e => {
    if (captureInput)
        e.preventDefault();
    if (e.button >= 3)
        return;
    e.preventDefault();
    let pos;
    if (!captureInput) {
        canvas.requestPointerLock();
        pos = v2(e.offsetX, e.offsetY);
    }
    else {
        pos = mousePos.slice();
    }
    ui.addMouseEvent(new GameMouseEvent(1, e.button, pos));
});
canvas.addEventListener("pointermove", e => {
    if (captureInput) {
        mousePos.mut().add2(e.movementX, e.movementY);
        mousePos[0] = Math.min(Math.max(0, mousePos[0]), canvas.width);
        mousePos[1] = Math.min(Math.max(0, mousePos[1]), canvas.height);
    }
    else {
        mousePos = v2(e.offsetX, e.offsetY);
    }
});
const userGestureEvents = ["keydown", "mousedown", "pointerup"];
const startAudioContexts = () => {
    void uiSounds.audioContext.resume();
    void gameSounds.audioContext.resume();
    userGestureEvents.forEach(name => { canvas.removeEventListener(name, startAudioContexts); });
};
userGestureEvents.forEach(name => { canvas.addEventListener(name, startAudioContexts); });
//# sourceMappingURL=global.js.map