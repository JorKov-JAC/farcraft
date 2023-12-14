import Clock, { TweenTarget } from "./engine/clock.js"
import "./engine/vector.js"
import { context, images, keys, uiSounds } from "./global.js"

/** The max delta time for updates (for stability). */
const MAX_UPDATE_DT = 1/15

// TODO Testing code
void uiSounds.playMusic("music_aStepCloser")
const clock = new Clock()
const a = {
	x: 5,
	y: 3,
	name: "hi",
	useless: {
		date: "today"
	},
	sub: {
		w: 20,
		h: 10,
		subname: "sub",
		subsub: {
			z: 30,
			subsubname: "subsub"
		},
		useless: {
			g: "hiii"
		}
	}
}

void clock.tween(a, {x: 200, y: 150}, 5).then(offset => {
	console.log("with offset: " + offset)
	void clock.tween(a, {sub: {w: 5}}, 2)
})
void clock.tween(a, {sub: {w: 200, h: 200}}, 15)

/** Performs a single tick (update, render) */
function tick(dt: number) {
	const anim = images.getAnim("marine", "die")
	context.drawImage(anim.frames[3]!.bitmap, 0, 0)

	context.fillStyle = "#F00"
	context.fillRect(a.x, a.y, a.sub.w, a.sub.h)

	clock.update(dt)
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

