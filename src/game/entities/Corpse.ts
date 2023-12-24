import { ImageGroupName } from "../../assets.js";
import { SerializableClock } from "../../engine/clock.js";
import { images } from "../../global.js";
import Anim from "../Anim.js";
import Entity from "../Entity.js";
import SerializableId from "../SerializableId.js";
import ArmyEntity from "./ArmyEntity.js";

export default class Corpse<T extends ImageGroupName> extends Entity<T> {
	clock: SerializableClock
	base: ArmyEntity<T>
	done: boolean

	constructor(base: ArmyEntity<T>) {
		const animGroupName = base.anim.groupName

		let anim: Anim<T>
		let done: boolean = false
		const dieAnimName = "die"
		if (images.hasAnim(animGroupName, dieAnimName)) {
			anim = new Anim(animGroupName, dieAnimName)
		} else {
			anim = base.anim
			done = true
		}

		super({ pos: base.pos, angle: base.angle, initialAnimation: anim });

		this.base = base
		this.done = done
		this.clock = new SerializableClock()
		this.clock.wait(anim.getDuration(), 0, [this as Corpse<T>, "markAsDone"] as const)
	}

	override updateImpl(dt: number): void {
		this.anim.advance(dt)
		this.clock.update(dt)
	}

	override renderImpl() {
		if (this.done) return
		super.renderImpl()
	}

	override shouldCleanUp(): boolean {
		return this.done
	}

	override getRadius() {
		return this.base.getRadius()
	}

	markAsDone() {
		this.done = true
	}

	override classId(): SerializableId {
		return SerializableId.CORPSE
	}
}
