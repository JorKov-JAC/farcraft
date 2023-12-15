import { ScreenCoord } from "../engine/ui/ScreenCoord.js"
import { Panel } from "../engine/ui/Panel.js"
import type Game from "./Game.js"

export default class Camera extends Panel {
	game: Game
	worldPos: V2
	maxLen: number

	/**
	 * 
	 * @param game The game this camera is attached to
	 * @param pos Position in tiles
	 * @param maxLen Camera view area in tiles
	 */
	constructor(uiPos: ScreenCoord, uiSize: ScreenCoord, game: Game, pos: V2, maxLen: number) {
		super(uiPos, uiSize)
		this.game = game
		this.worldPos = pos.slice()
		this.maxLen = maxLen
	}
}
