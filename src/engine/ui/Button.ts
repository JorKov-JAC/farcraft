import { ScreenCoord } from "./ScreenCoord.js";
import { Panel } from "./Panel.js";

export class Button extends Panel {
	beingHeld = false
	clickCallback: () => void

	constructor(clickCallback: () => void, pos: ScreenCoord, size: ScreenCoord) {
		super(pos, size)
		this.clickCallback = clickCallback
	}

	override onClick(pos: V2) {
		super.onClick(pos)
		this.clickCallback()
	}

	override onPress(pos: V2): void {
		super.onPress(pos)
		this.beingHeld = true
	}

	override onUnpress(pos: V2): void {
		super.onUnpress(pos)
		this.beingHeld = false
	}
}
