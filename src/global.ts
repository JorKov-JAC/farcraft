import assets from "./assets.js";
import { canvas } from "./context.js";
import GameStateManager from "./engine/GameStateManager.js";
import { SoundManager } from "./engine/audio.js";
import { UiClock } from "./engine/clock.js";
import { ImageManager } from "./engine/images.js";
import { GameMouseEvent, MouseButton, MouseEventType } from "./engine/ui/GameMouseEvent.js";
import UiTree from "./engine/ui/UiTree.js";
import { v2 } from "./engine/vector.js";
import LoadingState from "./game/gameStates/LoadingState.js";

/** The game's top-level state machine. */
export const gameStateManager = new GameStateManager(() => new LoadingState())

export let mousePos: V2 = v2(canvas.width / 2, canvas.height / 2)
/** True if inputs are being captured by the game. */
export let captureInput = false

// Load tech font
const techFont = new FontFace("tech", "url(assets/fonts/orbitron.ttf)")
await techFont.load()
document.fonts.add(techFont)

export const images = await ImageManager.create(assets.images)
export const uiSounds = await SoundManager.create(assets.sounds)
await uiSounds.audioContext.suspend()
export const gameSounds = await SoundManager.create(assets.sounds)
await gameSounds.audioContext.suspend()

export const uiClock = new UiClock()

// Use dynamic import to avoid looping dependencies:
// const UiTree = (await import("./engine/ui/UiTree.js")).default
export let ui = new UiTree()

/** Replaces the root UI tree and stops any relevant sounds. */
export function replaceUi(newUi: UiTree) {
	gameSounds.stopSounds()
	gameSounds.stopMusic()
	uiSounds.stopMusic()

	ui = newUi
}

export type CursorAnim = keyof (typeof assets)["images"]["cursor"]["anims"]
export let currentCursor: CursorAnim = "default"
/** Sets the current mouse cursor animation. */
export function setCursor(cursor: CursorAnim) {
	currentCursor = cursor
}

// Setup event listeners
/** A record of pressed keyboard keys. */
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
document.addEventListener("pointerlockchange", () => {
	if (document.pointerLockElement === canvas) {
		// We have successfully acquired the pointer (mouse), begin capturing
		// input:
		captureInput = true
		canvas.focus()
	} else {
		// We have lost the pointer lock:
		captureInput = false
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		for (const key in keys) { delete keys[key] }
	}
})

canvas.addEventListener("mousedown", e => {
	// If input is captured, always prevent default, even if the mouse button is
	// unused:
	if (captureInput) e.preventDefault()
	// Ignore undesired mouse button:
	if (e.button as MouseButton >= MouseButton._SIZE) return

	e.preventDefault()

	let pos: V2
	if (!captureInput) {
		// Try to begin capturing input
		canvas.requestPointerLock()
		pos = v2(e.offsetX, e.offsetY)
	} else {
		pos = mousePos.slice()
	}
	ui.addMouseEvent(new GameMouseEvent(MouseEventType.DOWN, e.button as MouseButton, pos))
})
canvas.addEventListener("mouseup", e => {
	// If input is captured, always prevent default, even if the mouse button is
	// unused:
	if (captureInput) e.preventDefault()
	// Ignore undesired mouse button:
	if (e.button as MouseButton >= MouseButton._SIZE) return

	e.preventDefault()

	let pos: V2
	if (!captureInput) {
		// Try to begin capturing input
		canvas.requestPointerLock()
		pos = v2(e.offsetX, e.offsetY)
	} else {
		pos = mousePos.slice()
	}
	ui.addMouseEvent(new GameMouseEvent(MouseEventType.UP, e.button as MouseButton, pos))
})
canvas.addEventListener("pointermove", e => {
	if (captureInput) {
		// When input is captured, move the virtual cursor position based on how
		// much the cursor was moved by (the actual cursor doesn't move):
		mousePos.mut().add2(e.movementX, e.movementY)
		mousePos[0] = Math.min(Math.max(0, mousePos[0]), canvas.width * (1 - Number.EPSILON*.5))
		mousePos[1] = Math.min(Math.max(0, mousePos[1]), canvas.height * (1 - Number.EPSILON*.5))
	} else {
		mousePos = v2(e.offsetX, e.offsetY)
	}
})

// Events which browsers consider a "user gesture":
const userGestureEvents = ["keydown", "mousedown", "pointerup"]

const startAudioContexts = () => {
	void uiSounds.audioContext.resume()
	void gameSounds.audioContext.resume()
	userGestureEvents.forEach(name => { canvas.removeEventListener(name, startAudioContexts) })
}

// Start the audio context as soon as we receive a "user gesture":
userGestureEvents.forEach(name => { canvas.addEventListener(name, startAudioContexts) })
