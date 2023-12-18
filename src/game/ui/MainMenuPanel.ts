import { ctx } from "../../context.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import { gameStateManager } from "../../global.js";
import GameplayState from "../gameStates/GameplayState.js";
import TechPanel from "./TechPanel.js";
import TextButton from "./buttons/TextButton.js";

export default class MainMenuPanel extends TechPanel {
	constructor(pos: ScreenCoord, size: ScreenCoord) {
		super(pos, size)

		let triedToLoad = false

		if (GameplayState.saveExists()) {
			this.addChildren(
				new TextButton(
					"Continue",
					() => {
						if (triedToLoad) return
						triedToLoad = true
						void (async () => {
							const gameplayState = await GameplayState.tryLoadGame()
							if (gameplayState === null) return
							void gameStateManager.switch(Promise.resolve(gameplayState))
						})()
					},
					ScreenCoord.rect(.2, .6),
					ScreenCoord.rect(.6, .1)
				)
			)
		}

		this.addChildren(
			new TextButton(
				"New Game",
				() => {
					void gameStateManager.switch(GameplayState.newGame())
				},
				ScreenCoord.rect(.2, .8),
				ScreenCoord.rect(.6, .1)
			)
		)
	}

	override renderImpl(): void {
		super.renderImpl()

		ctx.save()
		ctx.fillStyle = "#0F0"
		ctx.font = ScreenCoord.sq(0, .15).canvasSize[1] + "px tech"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillText("FarCraft", ...ScreenCoord.rect(.5, .2).canvasPos)
		ctx.restore()
	}
}
