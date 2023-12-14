import "./engine/vector.js";
import { context, images, keys, uiSounds } from "./global.js";
const MAX_UPDATE_DT = 1 / 15;
void uiSounds.playMusic("music_aStepCloser");
function tick(dt) {
    const anim = images.getAnim("marine", "die");
    context.drawImage(anim.frames[3].bitmap, 0, 0);
}
let lastTime = 0;
function tickLoop(time) {
    const dt = (time - lastTime) * .001;
    lastTime = time;
    tick(Math.min(dt, MAX_UPDATE_DT));
    for (const keyName in keys) {
        keys[keyName].justPressed = false;
    }
    requestAnimationFrame(tickLoop);
}
requestAnimationFrame(time => {
    lastTime = time;
    tickLoop(time);
});
//# sourceMappingURL=main.js.map