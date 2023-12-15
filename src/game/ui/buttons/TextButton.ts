import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import { ctx } from "../../../global.js";
import { Button } from "../../../engine/ui/Button.js";

export default class TextButton extends Button {
	text: string

	constructor(text: string, clickCallback: () => void, pos: ScreenCoord, size: ScreenCoord) {
		super(clickCallback, pos, size)
		this.text = text
	}

	override renderImpl(): void {
		const textHeight = ScreenCoord.rect(0, .8).canvasSize[1]

		ctx.save()

		ctx.fillStyle = "#000"
		ctx.strokeStyle = "#0F0"
		ctx.beginPath()
		ctx.roundRect(
			...ScreenCoord.rect(0, 0).canvasPos,
			...ScreenCoord.rect(1, 1).canvasSize,
			textHeight * .25
		)
		ctx.fill()
		ctx.stroke()

		ctx.fillStyle = this.beingHeld ? "#040" : "#0B0"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.font = textHeight + "px sans-serif"
		ctx.fillText(this.text, ...ScreenCoord.rect(.5, .5).canvasPos)

		ctx.restore()
	}
}
