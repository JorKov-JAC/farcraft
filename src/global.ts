import assets from "./assets.js";
import { canvas } from "./context.js";
import { SoundManager } from "./engine/audio.js";
import { ImageManager } from "./engine/images.js";
import { GameMouseEvent, MouseEventType } from "./engine/ui/GameMouseEvent.js";
import UiTree from "./engine/ui/UiTree.js";
import { v2 } from "./engine/vector.js";

// Setup event listeners
export let mousePos: V2 = v2(canvas.width / 2, canvas.height / 2)
export let captureInput = false

const techFont = new FontFace("tech", "url(assets/fonts/orbitron.ttf)")
await techFont.load()
document.fonts.add(techFont)

export const images = await ImageManager.create(assets.images)
export const uiSounds = await SoundManager.create(assets.sounds)
await uiSounds.audioContext.suspend()
export const gameSounds = await SoundManager.create(assets.sounds)
await gameSounds.audioContext.suspend()

// Use dynamic import to avoid looping dependencies
// const UiTree = (await import("./engine/ui/UiTree.js")).default
export const ui = new UiTree()

export const keys: Record<string, { justPressed: boolean }> = Object.create(null)
canvas.addEventListener("keydown", e => {
	if (captureInput) {
		keys[e.key] = { justPressed: true }
		e.preventDefault()
		e.stopPropagation()
	} else if (e.key === "Enter" || e.key === " ") canvas.requestPointerLock()
})
canvas.addEventListener("keyup", e => {
	if (captureInput) {
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete keys[e.key]
		e.preventDefault()
		e.stopPropagation()
	}
})
addEventListener("pointerlockchange", () => {
	if (document.pointerLockElement === canvas) {
		captureInput = true
	} else {
		captureInput = false
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		for (const key in keys) { delete keys[key] }
	}
})

canvas.addEventListener("mousedown", e => {
	let pos: V2
	if (!captureInput) {
		canvas.requestPointerLock()
		pos = v2(e.offsetX, e.offsetY)
	} else {
		pos = mousePos.slice()
	}
	ui.addMouseEvent(new GameMouseEvent(MouseEventType.DOWN, pos))
})
canvas.addEventListener("mouseup", e => {
	ui.addMouseEvent(new GameMouseEvent(MouseEventType.UP, v2(e.offsetX, e.offsetY)))
})
canvas.addEventListener("pointermove", e => {
	if (captureInput) {
		mousePos.mut().add2(e.movementX, e.movementY)
		mousePos[0] = Math.min(Math.max(0, mousePos[0]), canvas.width)
		mousePos[1] = Math.min(Math.max(0, mousePos[1]), canvas.height)
	} else {
		mousePos = v2(e.offsetX, e.offsetY)
	}
})

const userGestureEvents = ["keydown", "mousedown", "pointerup"]

const startAudioContexts = () => {
	void uiSounds.audioContext.resume()
	void gameSounds.audioContext.resume()
	userGestureEvents.forEach(name => { canvas.removeEventListener(name, startAudioContexts) })
}
userGestureEvents.forEach(name => { canvas.addEventListener(name, startAudioContexts) })
