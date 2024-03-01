import { ctx } from "../../context.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import { gameStateManager } from "../../global.js";
import GameplayState from "../gameStates/GameplayState.js";
import TechPanel from "./TechPanel.js";
import TextButton from "./buttons/TextButton.js";

/** Panel containing the main menu. */
export default class MainMenuPanel extends TechPanel {
	constructor(pos: ScreenCoord, size: ScreenCoord) {
		super(pos, size)

		let triedToLoad = false

		// Add continue button if a save exists:
		if (GameplayState.saveExists()) {
			this.addChildren(
				new TextButton(
					"Continue",
					() => {
						// Only try loading the saved game once in case the
						// player spams the button:
						if (triedToLoad) return
						triedToLoad = true

						// HACK Load the game before switching to it in case
						// loading fails
						// Async IIFE to load the game:
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

		// New game button
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

		// Display title
		ctx.save()
		ctx.fillStyle = "#0F0"
		ctx.font = ScreenCoord.sq(0, .15).canvasSize[1] + "px tech"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillText("FarCraft", ...ScreenCoord.rect(.5, .2).canvasPos)
		ctx.restore()
	}
}
