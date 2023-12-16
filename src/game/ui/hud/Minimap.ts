import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import { ctx } from "../../../context.js";
import TechPanel from "../TechPanel.js";
import TextButton from "../buttons/TextButton.js";
import { gameStateManager } from "../../../global.js";
import GameplayState from "../../gameStates/GameplayState.js";

export default class Minimap extends TechPanel {
	constructor(pos: ScreenCoord, size: ScreenCoord) {
		super(pos, size)

		this.children.push(new TextButton(
			"Save",
			() => {
				const gameplayState = gameStateManager.state as GameplayState
				gameplayState.saveGame()
			},
			ScreenCoord.rect(.2, .7),
			ScreenCoord.rect(.6, .2)
		))
	}

	override renderImpl(): void {
		super.renderImpl()
		ctx.save()

		const fontHeight = ScreenCoord.sq(0, .15).canvasSize[1]

		ctx.fillStyle = "#0F0"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.font = fontHeight + "px tech"

		ctx.fillText("FarCraft", ...ScreenCoord.rect(.5, .5).canvasPos)

		ctx.restore()
	}
}
