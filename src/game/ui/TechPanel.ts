import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import { Panel } from "../../engine/ui/Panel.js";
import { ctx } from "../../context.js";

export default class TechPanel extends Panel {
	static INSET = 0.0025

	constructor(pos: ScreenCoord, size: ScreenCoord) {
		super(pos, size)
		const innerPanel = new Panel(
			ScreenCoord.rootSq(TechPanel.INSET, TechPanel.INSET),
			ScreenCoord.rect(1, 1).addRootSq(-TechPanel.INSET * 2, -TechPanel.INSET * 2)
		)
		this._trueChildren.push(innerPanel)
	}

	override getPublicChildren() {
		return this._trueChildren[0]!.getPublicChildren()
	}

	override renderImpl(): void {
		const pos = ScreenCoord.rect(0, 0).canvasPos
		const size = ScreenCoord.rect(1, 1).canvasSize

		const gradient = ctx.createLinearGradient(...pos, pos[0], pos[1] + size[1])
		gradient.addColorStop(0, "#010")
		gradient.addColorStop(1, "#000")

		const insetPixels = ScreenCoord.rootSq(TechPanel.INSET, 0).canvasSize[0]
		ctx.save()
		ctx.fillStyle = gradient
		ctx.strokeStyle = "#0F0"
		ctx.lineWidth = insetPixels * 2
		ctx.beginPath()
		ctx.roundRect(...pos, ...size, insetPixels * 3)
		ctx.fill()
		ctx.stroke()
		ctx.restore()
	}
}
