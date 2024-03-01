// Setup the canvas
export const canvas = document.getElementById("game") as HTMLCanvasElement;
const ASPECT_RATIO = 4/3
canvas.tabIndex = 0
canvas.width = 960
canvas.height = canvas.width / ASPECT_RATIO

// Setup the 2D context
export const ctx = canvas.getContext("2d", { alpha: false })!;
ctx.imageSmoothingEnabled = false
