import { AnimName, ImageGroupName } from "../assets.js";
import { clamp, mod } from "../engine/util.js";
import { images } from "../global.js";
import Serializable from "./Serializable.js"
import SerializableId from "./SerializableId.js";

export default class Anim<T extends ImageGroupName> implements Serializable {
	groupName: T
	animationName: AnimName<T>
	frameTime: number

	constructor(groupName: T, animationName: AnimName<T>, frameTime = 0) {
		this.groupName = groupName
		this.animationName = animationName
		this.frameTime = frameTime
	}

	advance(dFrameTime: number) {
		this.frameTime += dFrameTime
		this.frameTime = mod(this.frameTime, this.getDuration())
	}

	/**
	 * @param fraction A number within 0..1. Numbers outside this range are
	 * clamped, not looped.
	 */
	setNorm(fraction: number) {
		// TODO It is possible to end up with a frameTime of exactly duration
		// this way. The fact that this interacts weirdly with advance hints
		// that this should be another class.
		this.frameTime = clamp(fraction, 0, 1 - Number.EPSILON * .5) * this.getDuration()
	}

	getAnim() {
		return images.getAnim(this.groupName as any, this.animationName as any)
	}

	getDuration() {
		const anim = this.getAnim()
		if ("duration" in anim) {
			return anim.duration
		}
		return 1
	}

	getSprite() {
		const anim = this.getAnim()
		const idx = Math.min(
			Math.floor(this.frameTime / this.getDuration() * anim.frames.length),
			anim.frames.length - 1
		)

		return anim.frames[idx]!
	}

	classId(): SerializableId {
		return SerializableId.ANIMATION
	}
}
