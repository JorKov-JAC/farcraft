import { ctx } from "../../context.js";
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

		const sprite = this.getCurrentSprite()

		const selected = game.selectedEnts.has(this)

		if (selected) {
			ctx.save()
			ctx.translate(this.sprite
			ctx.arc
			ctx.restore()
		}
	}

	renderImpl() {
		const sprite = this.getCurrentSprite()

		sprite.render(-sprite.size[0] / 2, -sprite.size[1])
	}

	abstract getCurrentSprite(): Sprite
	abstract getRadius(): number
	abstract getMaxHealth(): number
}
