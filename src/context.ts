export const canvas = document.getElementById("game") as HTMLCanvasElement;
const ASPECT_RATIO = 4/3
canvas.tabIndex = 0
canvas.width = 640
canvas.height = canvas.width / ASPECT_RATIO

export const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false
