import assets from "./assets.js"
import { ImageManager } from "./engine/images.js"

const canvas = document.getElementById("game") as HTMLCanvasElement
canvas.width = 640
canvas.height = canvas.width / 4 * 3

const context = canvas.getContext("2d")!
context.imageSmoothingEnabled = false

const images = await ImageManager.create(assets.images)

context.drawImage(images.getImage("infantry"), 0, 0)
