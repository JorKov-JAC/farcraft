import assets from "../assets.js";
import { ctx } from "../context.js";
import { provide } from "../engine/Provider.js";
import { SerializableClock } from "../engine/clock.js";
import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
import { v2 } from "../engine/vector.js";
import { gameStateManager, keys, mousePos } from "../global.js";
import Camera from "./Camera.js";
import Serializable from "./Serializable.js";
import SerializableId from "./SerializableId.js";
import World from "./World.js";
import ArmyEntity, { Owner } from "./entities/ArmyEntity.js";
import Unit from "./entities/Unit.js";
import ScoreScreenState from "./gameStates/ScoreScreenState.js";
import Hud from "./ui/Hud.js";

export default class Game implements Serializable<Game, {world: World, camera: Camera}> {
	static GAME_END_DELAY = 1

	hud: Hud
	world: World
	camera: Camera

	clock = new SerializableClock()

	ongoingDrag: V2 | null = null

	private selectedEnts: Set<ArmyEntity<any>> = new Set()

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
		this.clock.update(dt)

		provide(Game, this, () => {
			this.camera.update(dt)
			this.world.update(dt)
		})

		for (const e of this.selectedEnts.values()) {
			if (e.health <= 0) this.selectedEnts.delete(e)
		}

		// Check for end of game
		if (
			!this.world.ents.find(e => e instanceof Unit && e.owner === Owner.PLAYER)
			|| !this.world.ents.find(e => e instanceof Unit && e.owner === Owner.ENEMY)
		) {
			this.clock.wait(Game.GAME_END_DELAY, 0, [this, "endGame"])
		}
	}

	endGame() {
		const remainingUnits = this.world.ents.filter(e => e instanceof Unit && e.owner === Owner.PLAYER) as Unit<any>[]
		const timeTaken = this.clock.getTime()
		void gameStateManager.switch(Promise.resolve(new ScoreScreenState(remainingUnits, timeTaken)))
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
			if (!keys["Shift"]) this.selectedEnts.clear()
			for (const ent of selected) {
				this.selectedEnts.add(ent)
			}
		}

		this.ongoingDrag = null
	}

	orderMove(pos: V2) {
		const commandId = Math.random()
		for (const e of this.selectedEnts.values()) {
			if (!(e instanceof Unit)) continue

			e.commandMoveTo(pos, this.world, commandId)
		}
	}

	orderAttackMove(pos: V2) {
		const commandId = Math.random()
		for (const e of this.selectedEnts.values()) {
			if (!(e instanceof Unit)) continue

			e.commandAttackMoveTo(pos, this.world, commandId)
		}
	}

	isSelected(e: ArmyEntity<any>) {
		return this.selectedEnts.has(e)
	}

	classId(): SerializableId {
		return SerializableId.GAME
	}
	preSerialization() {
		this.ongoingDrag = null
		
		this.selectedEnts = Array.from(this.selectedEnts.values()) as any
	}
	postSerialization(): void {
		this.selectedEnts = new Set(this.selectedEnts)
	}
	postDeserialize() {
		this.postSerialization()

		this.hud = new Hud(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), this)
	}
}
