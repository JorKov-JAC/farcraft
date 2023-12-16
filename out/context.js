export const canvas = document.getElementById("game");
const ASPECT_RATIO = 4 / 3;
canvas.tabIndex = 0;
canvas.width = 960;
canvas.height = canvas.width / ASPECT_RATIO;
export const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
//# sourceMappingURL=context.js.map