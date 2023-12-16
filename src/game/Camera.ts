import { ScreenCoord } from "../engine/ui/ScreenCoord.js"
import { Panel } from "../engine/ui/Panel.js"
import type Game from "./Game.js"
import Serializable from "./Serializable.js"
import SerializableId from "./SerializableId.js"
import { captureInput, keys, mousePos } from "../global.js"
import { canvas } from "../context.js"
import { v2 } from "../engine/vector.js"

export default class Camera implements Serializable {
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
	constructor(game: Game, pos: V2, minLen: number) {
		this.game = game
		this.worldPos = pos.slice()
		this.minLen = minLen
	}

	// override renderImpl(): void {
	// 	this.game.render(
	// 		...ScreenCoord.rect(0, 0).canvasPos, 
	// 		...ScreenCoord.rect(1, 1).canvasSize,
	// 	)
	// }

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	update(dt: number): void {
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

		this.moveToward(moveVec, dt)

		// Clamp position
		const actualSize = this.game.hud.worldPanel.getActualSize()
		const vMin = Math.min(actualSize[0], actualSize[1])
		const scale = this.minLen / vMin

		const tilemap = this.game.world.tilemap

		this.worldPos[0] = Math.min(Math.max(0, this.worldPos[0]), tilemap.width - actualSize[0] * scale)
		this.worldPos[1] = Math.min(Math.max(0, this.worldPos[1]), tilemap.height - actualSize[1] * scale * (1 - this.extraYMult))
	}

	canvasPosToWorld(pos: V2) {
		const panel = this.game.hud.worldPanel
		const panelPos = panel.getActualPos()
		const panelSize = panel.getActualSize()

		const vMin = panelSize.min()
		const tileLen = vMin / this.minLen

		return pos.slice().sub(panelPos).mul(1/tileLen).add(this.worldPos)
	}

	worldPosToCanvas(pos: V2) {
		const panel = this.game.hud.worldPanel
		const panelPos = panel.getActualPos()
		const panelSize = panel.getActualSize()

		const vMin = panelSize.min()
		const tileLen = vMin / this.minLen

		return pos.slice().sub(this.worldPos).mul(tileLen).add(panelPos)
	}

	moveToward(v: V2, dt: number) {
		this.worldPos.mut().add(v.slice().mul(Camera.speed * this.minLen * dt))
	}

	classId(): SerializableId {
		return SerializableId.CAMERA
	}
}
