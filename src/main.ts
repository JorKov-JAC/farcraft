import "./engine/vector.js"
import { context, images, keys, uiSounds } from "./global.js"

/** The max delta time for updates (for stability). */
const MAX_UPDATE_DT = 1/15

void uiSounds.playMusic("music_aStepCloser")

/** Performs a single tick (update, render) */
function tick(dt: number) {
	const anim = images.getAnim("marine", "die")
	context.drawImage(anim.frames[3]!.bitmap, 0, 0)
}

let lastTime = 0
/** Repeatedly {@link tick} on each animation frame indefinitely */
function tickLoop(time: number) {
	const dt = (time - lastTime) * .001
	lastTime = time

	tick(Math.min(dt, MAX_UPDATE_DT))

	for (const keyName in keys) {
		keys[keyName]!.justPressed = false
	}

	requestAnimationFrame(tickLoop)
}

// Begin ticks
requestAnimationFrame(time => {
	lastTime = time
	tickLoop(time)
})

