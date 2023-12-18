import { ImageGroupName } from "../assets.js";
import { ctx } from "../context.js";
import { current } from "../engine/Provider.js";
import Anim from "./Anim.js";
import Game from "./Game.js";
import Serializable from "./Serializable.js"
import SerializableId from "./SerializableId.js";

export type EntityArgs<AnimGroupName extends ImageGroupName> = {
	pos: V2,
	initialAnimation: Anim<AnimGroupName>
	angle: number
}

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

	baseUpdate(dt: number) {
		this.updateImpl(dt)
	}
	abstract updateImpl(dt: number): void

	baseRender() {
		this.renderImpl()
	}
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
			ctx.scale(-1, 1)
			// ctx.rotate((Math.PI - this.angle) * .25)
		} else {
			// ctx.rotate(((this.angle + Math.PI * .25) % (2 * Math.PI) - Math.PI * .25) * .25)
		}

		ctx.translate(...spriteSize.slice().neg().mul(.5 * camera.worldSizeToCanvasFactor()).lock())

		sprite.render(0, 0, len * camera.worldSizeToCanvasFactor())

		ctx.restore()
	}

	abstract getRadius(): number

	shouldCleanUp() { return false }

	getCurrentSprite() {
		return this.anim.getSprite()
	}
}
