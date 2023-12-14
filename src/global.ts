import assets from "./assets.js";
import { SoundManager } from "./engine/audio.js";
import { ImageManager } from "./engine/images.js";
import { GameMouseEvent, MouseEventType } from "./engine/ui.js";
import { v2 } from "./engine/vector.js";

export const images = await ImageManager.create(assets.images)
export const uiSounds = await SoundManager.create(assets.sounds)
await uiSounds.audioContext.suspend()
export const gameSounds = await SoundManager.create(assets.sounds)
await gameSounds.audioContext.suspend()

// Use dynamic import to avoid looping dependencies
const UiTree = (await import("./engine/UiTree.js")).default
export const ui = new UiTree()

const ASPECT_RATIO = 4/3
export const canvas = document.getElementById("game") as HTMLCanvasElement
canvas.tabIndex = 0
canvas.width = 640
canvas.height = canvas.width / ASPECT_RATIO

export const ctx = canvas.getContext("2d")!
ctx.imageSmoothingEnabled = false

export const keys: Record<string, { justPressed: boolean }> = Object.create(null)
canvas.addEventListener("keydown", e => keys[e.key] = { justPressed: true })
// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
canvas.addEventListener("keyup", e => delete keys[e.key])
canvas.addEventListener("mousedown", e => { ui.addMouseEvent(new GameMouseEvent(MouseEventType.DOWN, v2(e.offsetX, e.offsetY))) })
canvas.addEventListener("mouseup", e => { ui.addMouseEvent(new GameMouseEvent(MouseEventType.UP, v2(e.offsetX, e.offsetY))) })

const userGestureEvents = ["keydown", "mousedown", "pointerup"]

const startAudioContexts = () => {
	void uiSounds.audioContext.resume()
	void gameSounds.audioContext.resume()
	userGestureEvents.forEach(name => { canvas.removeEventListener(name, startAudioContexts) })
}
userGestureEvents.forEach(name => { canvas.addEventListener(name, startAudioContexts) })
