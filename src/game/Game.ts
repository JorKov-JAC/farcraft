import assets from "../assets.js";
import { ctx } from "../context.js";
import { provide } from "../engine/Provider.js";
import { containerPosKey } from "../engine/ui/Panel.js";
import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
import { v2 } from "../engine/vector.js";
import { mousePos } from "../global.js";
import Camera from "./Camera.js";
import Serializable from "./Serializable.js";
import SerializableId from "./SerializableId.js";
import World from "./World.js";
import Hud from "./ui/Hud.js";

export default class Game implements Serializable<Game, {world: World, camera: Camera}> {
	hud: Hud
	world: World
	camera: Camera

	ongoingDrag: V2 | null = null

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

		ctx.save()
		if (this.ongoingDrag) {
			const canvasDragStart = this.camera.worldPosToCanvas(this.ongoingDrag).lock()
			ctx.fillStyle = "#0F02"
			ctx.strokeStyle = "#0F0B"
			ctx.beginPath()
			ctx.rect(...canvasDragStart, ...mousePos.slice().sub(canvasDragStart).lock())
			console.log(this.ongoingDrag, mousePos)
			ctx.fill()
			ctx.stroke()
		}
		ctx.restore()
	}

	hudCoordsToGameCoords(hudCoord: V2) {
		this.hud.worldPanel
	}

	startDrag(pos: V2) {
		this.ongoingDrag = this.camera.canvasPosToWorld(pos)
	}

	stopDrag(pos: V2) {
		this.ongoingDrag = null
	}

	classId(): SerializableId {
		return SerializableId.GAME
	}
	preSerialization() {
		this.ongoingDrag = null
	}
	postDeserialize() {
		this.hud = new Hud(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), this)
	}
}
