import { canvas, ctx } from "../../context.js";
import GameState from "../../engine/GameState.js";

export default class LoadingState extends GameState {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	override update(_dt: number): void {}

	override enter() {
		ctx.save()
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.font = Math.min(canvas.width, canvas.height) / 10 + "px tech"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillStyle = "#0F0"
		ctx.fillText("Loading...", canvas.width * .5, canvas.height * .5)
		ctx.restore()
	}
}
