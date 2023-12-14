import "./engine/vector.js"
import { context, images } from "./global.js"

/** The max delta time for updates (for stability). */
const MAX_UPDATE_DT = 1/15

/** Performs a single tick (update, render) */
function tick(dt: number) {
	const anim = images.getAnim("marine", "spawn")
	context.drawImage(anim.frames[3]!.bitmap, 0, 0)
}

let lastTime = 0
/** Repeatedly {@link tick} on each animation frame indefinitely */
function tickLoop(time: number) {
	const dt = (time - lastTime) * .001
	lastTime = time

	tick(Math.min(dt, MAX_UPDATE_DT))

	requestAnimationFrame(tickLoop)
}

// Begin ticks
requestAnimationFrame(time => {
	lastTime = time
	tickLoop(time)
})

