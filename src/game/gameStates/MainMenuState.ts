import GameState from "../../engine/GameState.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import UiTree from "../../engine/ui/UiTree.js";
import { replaceUi, uiSounds } from "../../global.js";
import MainMenuPanel from "../ui/MainMenuPanel.js";

/** State machine state for the main menu. */
export default class MainMenuState extends GameState {
	override update(dt: number): void {}

	override enter(): void {
		// Setup UI
		const ui = new UiTree()
		ui.panels.push(new MainMenuPanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1)))
		replaceUi(ui)

		// Play menu music
		uiSounds.playSoundtrackUntilStopped(["music_spritzTherapy"])
	}
}
