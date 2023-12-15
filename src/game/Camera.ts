import { ScreenCoord } from "../engine/ui/ScreenCoord.js"
import { Panel } from "../engine/ui/Panel.js"
import type Game from "./Game.js"
import Serializable from "./Serializable.js"
import SerializableId from "./SerializableId.js"

export default class Camera extends Panel implements Serializable {
	game: Game
	worldPos: V2
	minLen: number
	extraYMult: number = 0

	/** Scroll speed in minLens per second */
	static speed = 1.5

	/**
	 * @param game The game this camera is attached to
	 * @param pos Position in tiles
	 * @param minLen Minimum range of tiles the camera can see on either axis
	 */
	constructor(uiPos: ScreenCoord, uiSize: ScreenCoord, game: Game, pos: V2, minLen: number) {
		super(uiPos, uiSize)
		this.game = game
		this.worldPos = pos.slice()
		this.minLen = minLen
	}

	override renderImpl(): void {
		this.game.world.render(
			...ScreenCoord.rect(0, 0).canvasPos, 
			...ScreenCoord.rect(1, 1).canvasSize,
			...this.worldPos,
			this.minLen
		)
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	override updateImpl(_dt: number): void {
		const actualSize = this.getActualSize()
		const vMin = Math.min(actualSize[0], actualSize[1])
		const scale = this.minLen / vMin

		const tilemap = this.game.world.tilemap

		this.worldPos[0] = Math.min(Math.max(0, this.worldPos[0]), tilemap.width - actualSize[0] * scale)
		this.worldPos[1] = Math.min(Math.max(0, this.worldPos[1]), tilemap.height - actualSize[1] * scale * (1 - this.extraYMult))
	}

	override onPress(pos: V2): void {
		this.game.startDrag(pos)
	}

	override onUnpress(pos: V2): void {
		this.game.stopDrag(pos)
	}

	moveBy(v: V2, dt: number) {
		this.worldPos.mut().add(v.slice().mul(Camera.speed * this.minLen * dt))
	}

	classId(): SerializableId {
		return SerializableId.CAMERA
	}
}
