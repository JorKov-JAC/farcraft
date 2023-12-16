import { Panel } from "../../../engine/ui/Panel.js";
import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import { keys, mousePos } from "../../../global.js";
import Game from "../../Game.js";

export default class WorldPanel extends Panel {
	game: Game

	constructor(pos: ScreenCoord, size: ScreenCoord, game: Game) {
		super(pos, size)
		this.game = game
	}

	override renderImpl(): void {
		this.game.render(
			...ScreenCoord.rect(0, 0).canvasPos,
			...ScreenCoord.rect(1, 1).canvasSize,
		)
	}

	override updateImpl(dt: number): void {
		super.updateImpl(dt)
		if (keys["a"]) {
			this.game.orderAttackMove(this.game.camera.canvasPosToWorld(mousePos))
		}
	}

	override onPress(pos: V2): void {
		this.game.startDrag(this.game.camera.canvasPosToWorld(pos))
	}

	override onUnpress(pos: V2): void {
		this.game.stopDrag(this.game.camera.canvasPosToWorld(pos))
	}

	override onRightPress(pos: V2): void {
		this.game.orderMove(this.game.camera.canvasPosToWorld(pos))
	}
}
