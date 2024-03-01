import { ImageGroupName, SoundName } from "../../assets.js";
import { ctx } from "../../context.js";
import { current } from "../../engine/Provider.js";
import Entity, { EntityArgs } from "../Entity.js";
import Game from "../Game.js";

/** An owner of an {@link ArmyEntity}. */
export const enum Owner {
	PLAYER,
	ENEMY,
	RESCUABLE,
	NEUTRAL
}

/** Constructor arguments for {@link ArmyEntity}. */
export type ArmyEntityArgs<AnimGroupName extends ImageGroupName> = EntityArgs<AnimGroupName> & {
	owner: Owner,
}

/**
 * An ownable entity which can participate in combat (though it might not be
 * able to attack).
 */
export default abstract class ArmyEntity<AnimGroupName extends ImageGroupName> extends Entity<AnimGroupName> {
	/**
	 * The entity's current health.
	 * 
	 * Defaults to the initial value returned by {@link getMaxHealth}.
	 */
	health: number = this.getMaxHealth()
	owner: Owner

	constructor(args: ArmyEntityArgs<AnimGroupName>) {
		super(args)
		this.owner = args.owner
	}

	override baseRender(): void {
		const game = current(Game)
		const camera = game.camera
		const worldSizeToCanvasFactor = camera.worldSizeToCanvasFactor()

		const radius = this.getRadius()

		const selected = game.isSelected(this)

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

	/** Damages this entity's {@link health}. */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	takeDamage(amount: number, _source: ArmyEntity<any>) {
		this.health -= amount
	}

	/** The typical max and default values of {@link health}. */
	abstract getMaxHealth(): number
	/** The sound played when this entity dies. */
	abstract getDeathSound(): SoundName
}
