"use strict";
const canvas = document.getElementById("game");
canvas.width = 640;
canvas.height = canvas.width / 4 * 3;
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
const MAX_UPDATE_DT = 1 / 15;
function tick(dt) {
}
let lastTime = 0;
function tickLoop(time) {
    const dt = (time - lastTime) * .001;
    lastTime = time;
    tick(Math.min(dt, MAX_UPDATE_DT));
    requestAnimationFrame(tickLoop);
}
requestAnimationFrame(time => {
    lastTime = time;
    tickLoop(time);
});
//# sourceMappingURL=main.js.map