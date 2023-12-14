import { Panel, ScreenCoord } from "../../engine/ui.js";

export abstract class Button extends Panel {
	beingHeld = false
	clickCallback: () => void

	constructor(clickCallback: () => void, pos: ScreenCoord, size: ScreenCoord) {
		super(pos, size)
		this.clickCallback = clickCallback
	}

	override onClick() {
		super.onClick()
		this.clickCallback()
	}

	override onPress(): void {
		super.onPress()
		this.beingHeld = true
	}

	override onUnpress(): void {
		super.onUnpress()
		this.beingHeld = false
	}
}
