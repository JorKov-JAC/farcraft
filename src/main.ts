import { getImage } from "./engine/images.js"

const canvas = document.getElementById("game") as HTMLCanvasElement
canvas.width = 640
canvas.height = canvas.width / 4 * 3

const context = canvas.getContext("2d")!
context.imageSmoothingEnabled = false

getImage("infantry").then(e => {
	console.log("Done!")
	context.drawImage(e, 0, 0)
})
