import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import { Panel } from "../../engine/ui/Panel.js";
import { ctx } from "../../global.js";

export default class TechPanel extends Panel {
	override renderImpl(): void {
		const pos = ScreenCoord.rect(0, 0).canvasPos
		const size = ScreenCoord.rect(1, 1).canvasSize

		const gradient = ctx.createLinearGradient(...pos, pos[0], pos[1] + size[1])
		gradient.addColorStop(0, "#010")
		gradient.addColorStop(1, "#000")

		ctx.save()
		ctx.fillStyle = gradient
		ctx.strokeStyle = "#0F0"
		ctx.lineWidth = 4
		ctx.beginPath()
		ctx.roundRect(...pos, ...size, 6)
		ctx.fill()
		ctx.stroke()
		ctx.restore()
	}
}
