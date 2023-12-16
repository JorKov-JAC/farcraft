import { AnimName, ImageGroupName } from "../assets.js";
import { mod } from "../engine/util.js";
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
		const idx = Math.floor(this.frameTime / this.getDuration() * anim.frames.length)

		return anim.frames[idx]!
	}

	classId(): SerializableId {
		return SerializableId.ANIMATION
	}
}
