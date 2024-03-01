import { canvas, ctx } from "./context.js"
import { ScreenCoord } from "./engine/ui/ScreenCoord.js"
import "./engine/vector.js"
import MainMenuState from "./game/gameStates/MainMenuState.js"
import { captureInput, currentCursor, images, keys, mousePos, setCursor, ui, uiClock } from "./global.js"

/** The max delta time for updates (for stability). */
const MAX_UPDATE_DT = 1/15

const gameStateManager = (await import("./global.js")).gameStateManager
void gameStateManager.switch(Promise.resolve(new MainMenuState()))

/** Performs a single tick (update, render). */
function tick(dt: number) {
	setCursor("default")
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	uiClock.update(dt)
	ui.update(dt)
	gameStateManager.update(dt)

	ui.render()

	// Render cursor on top of everything else
	if (captureInput) {
		images.getAnim("cursor", currentCursor).frames[0]!.render(...mousePos, ScreenCoord.sq(.1, 0).canvasSize[0])
	}
}

let lastTime = 0
/** Repeatedly {@link tick} on each animation frame indefinitely. */
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

