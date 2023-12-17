import { ctx } from "../../context.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import { gameStateManager } from "../../global.js";
import MainMenuState from "../gameStates/MainMenuState.js";
import ScoreScreenState from "../gameStates/ScoreScreenState.js";
import TechPanel from "./TechPanel.js";
import TextButton from "./buttons/TextButton.js";

export default class ScoreScreenPanel extends TechPanel {
	scoreScreenState: ScoreScreenState

	constructor(pos: ScreenCoord, size: ScreenCoord, scoreScreenState: ScoreScreenState) {
		super(pos, size)

		this.scoreScreenState = scoreScreenState

		this.children.push(
			new TextButton(
				"Done",
				() => {
					void gameStateManager.switch(Promise.resolve(new MainMenuState()))
				},
				ScreenCoord.rect(.2, .8),
				ScreenCoord.rect(.6, .1)
			)
		)
	}

	override renderImpl(): void {
		const { remainingUnits, timeTaken } = this.scoreScreenState

		super.renderImpl()

		const titleText = remainingUnits.length > 0 ? "Victory" : "Defeat"
		const remainingHealth = remainingUnits.reduce((a, b) => a += b.health, 0)
		const points = Math.ceil(remainingHealth * 100 / Math.sqrt(timeTaken))

		ctx.save()
		ctx.fillStyle = "#0F0"
		ctx.font = ScreenCoord.sq(0, .15).canvasSize[1] + "px tech"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillText(titleText, ...ScreenCoord.rect(.5, .2).canvasPos)
		ctx.font = ScreenCoord.sq(0, .05).canvasSize[1] + "px tech"
		ctx.fillText("Total Remaining Health: " + remainingHealth, ...ScreenCoord.rect(.5, .35).canvasPos)
		const timeStr = `Time Taken: ${Math.floor(timeTaken / 60)}:${Math.ceil(timeTaken % 60).toString().padStart(2, "0")}`
		ctx.fillText(timeStr, ...ScreenCoord.rect(.5, .5).canvasPos)
		ctx.fillText("Points: " + points, ...ScreenCoord.rect(.5, .65).canvasPos)
		ctx.restore()
	}
}
