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

/** Handles the main game. */
export default class Game implements Serializable<Game, {world: World, camera: Camera}> {
	/** Seconds after the game is considered over before it actually ends. */
	static GAME_END_DELAY = 1

	hud: Hud
	world: World
	camera: Camera

	clock = new SerializableClock()

	/**
	 * The starting fractional tile coordinates of a current mouse drag, or null if there is none.
	 */
	ongoingDragStart: V2 | null = null

	private selectedEnts: Set<ArmyEntity<any>> = new Set()

	private constructor(world: World) {
		this.camera = new Camera(this, v2(0, 0), 10)
		this.world = world

		this.hud = null!
		this.postDeserialize()
	}

	/**
	 * Async constructor.
	 * 
	 * @param mapName The name of the map to load.
	 */
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

	/** Ends this game state and switches to another. */
	endGame() {
		const remainingPlayerUnits = this.world.ents.filter(e => e instanceof Unit && e.owner === Owner.PLAYER) as Unit<any>[]
		const timeTaken = this.clock.getTime()
		void gameStateManager.switch(Promise.resolve(new ScoreScreenState(remainingPlayerUnits, timeTaken)))
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
			if (this.ongoingDragStart) {
				const canvasDragStart = this.camera.worldPosToCanvas(this.ongoingDragStart).lock()
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
		this.ongoingDragStart = pos
	}

	stopDrag(endPos: V2) {
		if (!this.ongoingDragStart) return

		const selected = this.world
			.unitsWithinBoundsInclusive(...this.ongoingDragStart, ...endPos)
			.filter(e => e.owner === Owner.PLAYER)

		if (selected.length > 0) {
			if (!keys["Shift"]) this.selectedEnts.clear()
			for (const ent of selected) {
				this.selectedEnts.add(ent)
			}
		}

		this.ongoingDragStart = null
	}

	/** Orders the player's selected units to move to {@link pos}. */
	orderMove(pos: V2) {
		const commandId = Math.random()
		for (const e of this.selectedEnts.values()) {
			if (!(e instanceof Unit)) continue

			e.commandMoveTo(pos, this.world, commandId)
		}
	}

	/** Orders the player's selected units to "attack move" to {@link pos}. */
	orderAttackMove(pos: V2) {
		const commandId = Math.random()
		for (const e of this.selectedEnts.values()) {
			if (!(e instanceof Unit)) continue

			e.commandAttackMoveTo(pos, this.world, commandId)
		}
	}

	/** Checks if {@link e} is currently selected. */
	isSelected(e: ArmyEntity<any>) {
		return this.selectedEnts.has(e)
	}
	/** Sets the players selected entities. */
	setSelectedEnts(ents: Iterable<ArmyEntity<any>>) {
		this.selectedEnts.clear()
		for (const e of ents) this.selectedEnts.add(e)
	}
	/** Gets the player's selected entities. */
	getSelectedEnts(): Iterable<ArmyEntity<any>> {
		return this.selectedEnts.keys()
	}

	// Serialization
	classId(): SerializableId {
		return SerializableId.GAME
	}
	preSerialization() {
		this.ongoingDragStart = null
		
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
