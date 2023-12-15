import assets from "../assets.js";
import { canvas } from "../context.js";
import { Panel } from "../engine/ui/Panel.js";
import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
import { v2 } from "../engine/vector.js";
import { captureInput, keys, mousePos } from "../global.js";
import Camera from "./Camera.js";
import World from "./World.js";
import Hud from "./ui/Hud.js";

export default class Game {
	readonly panel: Panel
	world: World
	camera: Camera

	private constructor(world: World) {
		this.camera = new Camera(ScreenCoord.rect(0, 0), ScreenCoord.rect(0, 0), this, v2(0, 0), 10)
		this.panel = new Hud(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), this.camera)
		this.world = world
	}

	static async create(mapName: keyof typeof assets["maps"]) {
		const world = await World.create(mapName)
		return new Game(world)
	}

	update(dt: number) {
		const moveVec = v2(0, 0).mut()
		if (keys["ArrowRight"]) moveVec[0] += 1
		if (keys["ArrowLeft"]) moveVec[0] -= 1
		if (keys["ArrowUp"]) moveVec[1] -= 1
		if (keys["ArrowDown"]) moveVec[1] += 1

		if (captureInput) {
			if (mousePos[0] <= 3) moveVec[0] -= 1
			if (mousePos[0] >= canvas.width - 3) moveVec[0] += 1
			if (mousePos[1] <= 3) moveVec[1] -= 1
			if (mousePos[1] >= canvas.height - 3) moveVec[1] += 1
		}

		this.camera.moveBy(moveVec, dt)
	}

	startDrag(pos: V2) {

	}

	stopDrag(pos: V2) {

	}
}
