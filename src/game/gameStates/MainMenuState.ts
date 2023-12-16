import { GameState } from "../../engine/GameState.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import UiTree from "../../engine/ui/UiTree.js";
import { replaceUi, uiSounds } from "../../global.js";
import MainMenuPanel from "../ui/MainMenuPanel.js";

export default class MainMenuState extends GameState {
	override update(dt: number): void {}

	private constructor() {
		super()
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	static async create() {
		return new MainMenuState()
	}

	override enter(): void {
		const ui = new UiTree()

		ui.panels.push(new MainMenuPanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1)))
		replaceUi(ui)
		uiSounds.playSoundtrackUntilStopped(["music_spritzTherapy"])
	}
}
