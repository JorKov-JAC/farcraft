import { ImageGroupName } from "../assets.js";
import { ctx } from "../context.js";
import { current } from "../engine/Provider.js";
import Anim from "./Anim.js";
import Game from "./Game.js";
import Serializable from "./Serializable.js"
import SerializableId from "./SerializableId.js";

/** Constructor arguments for {@link Entity}. */
export type EntityArgs<AnimGroupName extends ImageGroupName> = {
	pos: V2,
	initialAnimation: Anim<AnimGroupName>
	angle: number
}

/** An entity which exists in a {@link World}. */
export default abstract class Entity<AnimGroupName extends ImageGroupName> implements Serializable {
	abstract classId(): SerializableId
	pos: V2
	anim: Anim<AnimGroupName>
	angle: number

	constructor(args: EntityArgs<AnimGroupName>) {
		this.pos = args.pos
		this.anim = args.initialAnimation
		this.angle = args.angle
	}

	/** Calls {@link updateImpl}. Useful for wrapping a child implementation. */
	baseUpdate(dt: number) {
		this.updateImpl(dt)
	}
	/** The implementation for updating this entity. See {@link baseUpdate}. */
	abstract updateImpl(dt: number): void

	/** Calls {@link renderImpl}. Useful for wrapping a child implementation. */
	baseRender() {
		this.renderImpl()
	}
	/** The implementation for rendering this entity. See {@link baseRender}. */
	renderImpl() {
		ctx.save()

		const camera = current(Game).camera

		const sprite = this.getCurrentSprite()

		const len = this.getRadius() * 2
		const spriteSize = sprite.sizeWithin(len)
		const worldPos = this.pos.slice()
		const canvasPos = camera.worldPosToCanvas(worldPos).lock()

		ctx.translate(...canvasPos)
		if (this.angle > Math.PI * .5 && this.angle < Math.PI * 1.5) {
			// Flip the sprite horizontally:
			ctx.scale(-1, 1)
			// ctx.rotate((Math.PI - this.angle) * .25)
		} else {
			// ctx.rotate(((this.angle + Math.PI * .25) % (2 * Math.PI) - Math.PI * .25) * .25)
		}

		ctx.translate(
			...spriteSize
				.slice()
				.neg()
				.mul(
					// Center:
					.5
					// Convert to viewport space:
					* camera.worldSizeToCanvasFactor())
				.lock()
		)

		sprite.render(0, 0, len * camera.worldSizeToCanvasFactor())

		ctx.restore()
	}

	/** Gets this entities radius. */
	abstract getRadius(): number

	/** Returns true if this entity should be removed from the world. */
	shouldCleanUp() { return false }

	/** Gets this entity's current sprite. */
	getCurrentSprite() {
		return this.anim.getSprite()
	}
}
