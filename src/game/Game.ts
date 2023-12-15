import assets from "../assets.js";
import { canvas } from "../context.js";
import { Panel } from "../engine/ui/Panel.js";
import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
import { v2 } from "../engine/vector.js";
import { captureInput, keys, mousePos } from "../global.js";
import Camera from "./Camera.js";
import Serializable, { DeserializationForm, SerializationForm } from "./Serializable.js";
import SerializableId from "./SerializableId.js";
import World from "./World.js";
import Hud from "./ui/Hud.js";

export default class Game implements Serializable<Game, {world: World, camera: Camera}> {
	hud: Hud
	world: World
	camera: Camera

	private constructor(world: World) {
		this.camera = new Camera(this, v2(0, 0), 10)
		this.world = world

		this.hud = null!
		this.postDeserialize()
	}

	static async create(mapName: keyof typeof assets["maps"]) {
		const world = await World.create(mapName)
		return new Game(world)
	}

	update(dt: number) {
		this.camera.update(dt)
	}

	render(x: number, y: number, w: number, h: number) {
		this.world.render(
			x, y,
			w, h,
			...this.camera.worldPos,
			this.camera.minLen
		)
	}

	startDrag(pos: V2) {

	}

	stopDrag(pos: V2) {

	}

	classId(): SerializableId {
		return SerializableId.GAME
	}
	postDeserialize() {
		this.hud = new Hud(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), this)
	}
}
