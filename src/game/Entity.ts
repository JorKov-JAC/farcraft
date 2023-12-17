import { ImageGroupName } from "../assets.js";
import Anim from "./Anim.js";
import Serializable from "./Serializable.js"
import SerializableId from "./SerializableId.js";

export type EntityArgs<AnimGroupName extends ImageGroupName> = {
	pos: V2,
	initialAnimation: Anim<AnimGroupName>
}

export default abstract class Entity<AnimGroupName extends ImageGroupName> implements Serializable {
	abstract classId(): SerializableId
	pos: V2
	anim: Anim<AnimGroupName>

	constructor(args: EntityArgs<AnimGroupName>) {
		this.pos = args.pos
		this.anim = args.initialAnimation
	}

	baseUpdate(dt: number) {
		this.updateImpl(dt)
	}
	abstract updateImpl(dt: number): void

	baseRender() {
		this.renderImpl()
	}
	abstract renderImpl(): void

	abstract getRadius(): number

	shouldCleanUp() { return false }

	getCurrentSprite() {
		return this.anim.getSprite()
	}
}
