import Clock from "./engine/clock.js"
import { ScreenCoord } from "./engine/ui/ScreenCoord.js"
import "./engine/vector.js"
import { captureInput, images, keys, mousePos, ui, uiSounds } from "./global.js"
import { ctx } from "./context.js"
import TechPanel from "./game/ui/TechPanel.js"
import TextButton from "./game/ui/buttons/TextButton.js"
import Game from "./game/Game.js"
import { v2 } from "./engine/vector.js"
import { serialize } from "./game/Serialize.js"

/** The max delta time for updates (for stability). */
const MAX_UPDATE_DT = 1/15

// TODO Testing code
uiSounds.playSoundtrackUntilStopped(["music_aStepCloser", "music_darkfluxxTheme"])
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

const techPanel = new TechPanel(ScreenCoord.rect(0.5, 0.5).setSq(-.25, -.25), ScreenCoord.sq(.5, .5))
techPanel.children.push(new TextButton("Hello", () => { console.log("clicked!") }, ScreenCoord.rect(.25, .5).setSq(0, -.125), ScreenCoord.rect(.5, 0).setSq(0, .25)))
ui.panels.push(techPanel)

const mapTiles = images.getAllSprites("techTiles")
let currentTile = 0

function nextSprite(offset = 0) {
	++currentTile
	currentTile %= mapTiles.length

	void clock.wait(.2, offset).then(nextSprite)
}

nextSprite()

const game = await Game.create("m1")
console.log(serialize(game))
console.dir(game.world.pathfind(v2(6, 9), v2(6, 5)))
ui.panels.push(game.panel)




/** Performs a single tick (update, render) */
function tick(dt: number) {
	ctx.clearRect(0, 0, ...ScreenCoord.rect(1, 1).canvasSize)
	game.update(dt)
	ctx.fillStyle = "#f00"
	ctx.fillRect(0, 0, 640, 480)
	// .render(10, 10, 620, 460, -1.5, -1.5, 10)
	const anim = images.getAnim("marine", "die")
	ctx.drawImage(anim.frames[3]!.bitmap, 0, 0)

	ctx.fillStyle = "#F00"
	ctx.fillRect(a.x, a.y, a.sub.w, a.sub.h)

	ctx.drawImage(mapTiles[currentTile]!.bitmap, 20, 200)




	ui.update(dt)
	ui.render()
	if (captureInput) {
		images.getAnim("cursor", "default").frames[0]!.render(...mousePos)
	}

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

