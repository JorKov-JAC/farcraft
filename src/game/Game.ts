import assets from "../assets.js";
import { ctx } from "../context.js";
import { provide } from "../engine/Provider.js";
import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
import { v2 } from "../engine/vector.js";
import { mousePos } from "../global.js";
import Camera from "./Camera.js";
import Serializable from "./Serializable.js";
import SerializableId from "./SerializableId.js";
import World from "./World.js";
import ArmyEntity, { Owner } from "./entities/ArmyEntity.js";
import Unit from "./entities/Unit.js";
import Hud from "./ui/Hud.js";

export default class Game implements Serializable<Game, {world: World, camera: Camera}> {
	hud: Hud
	world: World
	camera: Camera

	ongoingDrag: V2 | null = null

	readonly selectedEnts: Set<ArmyEntity> = new Set()

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
		provide(Game, this, () => {

			this.camera.update(dt)
			this.world.update(dt)

		})

		for (const e of this.selectedEnts.values()) {
			if (e.health <= 0) this.selectedEnts.delete(e)
		}
	}

	render(x: number, y: number, w: number, h: number) {
		provide(Game, this, () => {
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
				ctx.fill()
				ctx.stroke()
			}
			ctx.restore()
		})
	}

	startDrag(pos: V2) {
		this.ongoingDrag = pos
	}

	stopDrag(endPos: V2) {
		if (!this.ongoingDrag) return

		const selected = this.world
			.unitsWithinBoundsInclusive(...this.ongoingDrag, ...endPos)
			.filter(e => e.owner === Owner.PLAYER)

		if (selected.length > 0) {
			this.selectedEnts.clear()
			for (const ent of selected) {
				this.selectedEnts.add(ent)
			}
		}

		this.ongoingDrag = null
	}

	orderMove(pos: V2) {
		for (const e of this.selectedEnts.values()) {
			if (!(e instanceof Unit)) continue

			e.startMovingTo(pos, this.world)
		}
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
