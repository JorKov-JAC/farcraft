import { ctx } from "../../../context.js"
import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js"
import TechPanel from "../TechPanel.js"

export default class Minimap extends TechPanel {
	// constructor(pos: ScreenCoord, size: ScreenCoord) {
	// 	super(pos, size)

	// 	this.addChildren(new TechPanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1)))
	// }

	override renderImpl(): void {
		super.renderImpl()
		ctx.save()

		const fontHeight = ScreenCoord.sq(0, .08).canvasSize[1]
		const gap = ScreenCoord.sq(0, .05).canvasSize[1]

		ctx.fillStyle = "#0F0"
		ctx.textAlign = "center"
		ctx.textBaseline = "top"
		ctx.font = fontHeight + "px tech"

		const lines = [
			"Controls:",
			"Left Mouse: Select",
			"Right Click: Move",
			"A: Attack Move",
		]
		const totalHeight = fontHeight * lines.length + gap * (lines.length - 1)

		const x = ScreenCoord.rect(.5, 0).canvasPos[0]
		let y = ScreenCoord.rect(0, .5).canvasPos[1] - totalHeight/2
		
		for (const line of lines) {
			ctx.fillText(line, x, y)

			y += gap + fontHeight
		}

		ctx.restore()
	}
}
