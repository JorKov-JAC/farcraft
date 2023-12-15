import { ctx } from "../../../context.js"
import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js"
import TechPanel from "../TechPanel.js"

export default class Minimap extends TechPanel {
	// constructor(pos: ScreenCoord, size: ScreenCoord) {
	// 	super(pos, size)

	// 	this.children.push(new TechPanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1)))
	// }

	override renderImpl(): void {
		super.renderImpl()
		ctx.save()

		const fontHeight = ScreenCoord.sq(0, .05).canvasSize[1]

		ctx.fillStyle = "#0F0"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.font = fontHeight + "px tech"

		ctx.fillText("Controls:\nRight Click: Move\nA: Attack move", ...ScreenCoord.rect(.5, .5).canvasPos, ScreenCoord.rect(1, 0).canvasSize[0])

		ctx.restore()
	}
}
