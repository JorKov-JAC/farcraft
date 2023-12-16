import { canvas, ctx } from "../../context.js";
import { current } from "../../engine/Provider.js";
import { Sprite } from "../../engine/images.js";
import Entity from "../Entity.js";
import Game from "../Game.js";

export const enum Owner {
	PLAYER,
	ENEMY,
	RESCUABLE
}

export default abstract class ArmyEntity extends Entity {
	health: number = this.getMaxHealth()
	owner: Owner
	pos: V2

	constructor(owner: Owner, pos: V2) {
		super()
		this.owner = owner
		this.pos = pos
	}

	override baseRender(): void {
		const game = current(Game)
		const camera = game.camera
		const worldSizeToCanvasFactor = camera.worldSizeToCanvasFactor()

		const radius = this.getRadius()

		const selected = game.selectedEnts.has(this)

		// Selection circle behind
		if (selected) {
			ctx.save()
			ctx.strokeStyle = "#0F0"
			ctx.lineWidth = 2
			ctx.translate(...camera.worldPosToCanvas(this.pos.slice().add2(0, radius * .5)).lock())
			ctx.scale(1, 3/8)
			ctx.beginPath()
			ctx.arc(0, 0, radius * worldSizeToCanvasFactor, 0, Math.PI, true)
			ctx.stroke()
			ctx.restore()
		}

		this.renderImpl()

		// Selection circle in front
		if (selected) {
			ctx.save()
			ctx.strokeStyle = "#0F0"
			ctx.lineWidth = 2
			ctx.translate(...camera.worldPosToCanvas(this.pos.slice().add2(0, radius * .5)).lock())
			ctx.scale(1, 3/8)
			ctx.beginPath()
			ctx.arc(0, 0, radius * worldSizeToCanvasFactor, 0, Math.PI, false)
			ctx.stroke()
			ctx.restore()
		}
	}

	abstract getCurrentSprite(): Sprite
	abstract getRadius(): number
	abstract getMaxHealth(): number
}
