import GameState from "../../engine/GameState.js"
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js"
import UiTree from "../../engine/ui/UiTree.js"
import { replaceUi } from "../../global.js"
import Unit from "../entities/Unit.js"
import ScoreScreenPanel from "../ui/ScoreScreenPanel.js"

export default class ScoreScreenState extends GameState {
	remainingUnits: Unit<any>[]
	timeTaken: number

	constructor(remainingUnits: Unit<any>[], timeTaken: number) {
		super()
		this.remainingUnits = remainingUnits
		this.timeTaken = timeTaken
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	override update(_dt: number): void {}

	override enter(): void {
		const ui = new UiTree()

		ui.panels.push(new ScoreScreenPanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), this))
		replaceUi(ui)
	}
}
