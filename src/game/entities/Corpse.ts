import { ImageGroupName } from "../../assets.js";
import { SerializableClock } from "../../engine/clock.js";
import { images } from "../../global.js";
import Anim from "../Anim.js";
import Entity from "../Entity.js";
import SerializableId from "../SerializableId.js";
import ArmyEntity from "./ArmyEntity.js";

/** Displays an animation of an {@link ArmyEntity} dying or being dead. */
export default class Corpse<T extends ImageGroupName> extends Entity<T> {
	clock: SerializableClock
	/** The entity which died to create this corpse. */
	base: ArmyEntity<T>
	/** True when this corpse should be cleaned up. */
	done: boolean

	constructor(base: ArmyEntity<T>) {
		const animGroupName = base.anim.groupName

		let anim: Anim<T>
		let done: boolean = false
		const dieAnimName = "die"
		if (images.hasAnim(animGroupName, dieAnimName)) {
			anim = new Anim(animGroupName, dieAnimName)
		} else {
			// No death animation, just disappear
			anim = base.anim
			done = true
		}

		super({ pos: base.pos, angle: base.angle, initialAnimation: anim });

		this.base = base
		this.done = done
		this.clock = new SerializableClock()
		// Mark this corpse as done once the animation is complete:
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

	/** Marks this corpse as done so that it can be cleaned up. */
	markAsDone() {
		this.done = true
	}

	// Serialization
	override classId(): SerializableId {
		return SerializableId.CORPSE
	}
}
