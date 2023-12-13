const canvas = document.getElementById("game") as HTMLCanvasElement
canvas.width = 640
canvas.height = canvas.width / 4 * 3

const context = canvas.getContext("2d")!
context.imageSmoothingEnabled = false

/** The max delta time for updates (for stability). */
const MAX_UPDATE_DT = 1/15

/** Performs a single tick (update, render) */
function tick(dt: number) {
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

