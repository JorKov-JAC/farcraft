import { Panel, ScreenCoord } from "../engine/ui.js";
import { ctx } from "../global.js";

export default class TechPanel extends Panel {
	override renderImpl(): void {
		const pos = ScreenCoord.rect(0, 0).canvasPos
		const size = ScreenCoord.rect(1, 1).canvasSize

		const gradient = ctx.createLinearGradient(...pos, pos[0], pos[1] + size[1])
		gradient.addColorStop(0, "#010")
		gradient.addColorStop(1, "#000")

		ctx.save()
		ctx.fillStyle = gradient
		ctx.fillRect(...pos, ...size)
		ctx.restore()
	}
}
