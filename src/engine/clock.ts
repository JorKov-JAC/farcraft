import Serializable from "../game/Serializable.js"
import SerializableCallback from "../game/SerializableCallback.js"
import SerializableId from "../game/SerializableId.js"

// type CanBeTweenTarget<T> = T extends number ? true : T extends object ? (true extends CanBeTweenTarget<T[keyof T]> ? true : never) : never
type CanBeTweenTarget<T> = T extends number ? true : T extends object ? true : never

// export type TweenTarget<T> = RemoveNever<{
// 	[K in keyof T]?: true extends CanBeTweenTarget<T[K]> ? (T[K] extends number ? number : TweenTarget<T[K]>) : never
// }>
export type TweenTarget<T> = RemoveNever<{
	[K in keyof T]?: true extends CanBeTweenTarget<T[K]> ? (T[K] extends number ? number : Partial<T[K]>) : never
}>

export class Tween implements Serializable {
	startTime: number
	endTime: number
	obj: any
	key: keyof any
	startVal: number
	targetVal: number

	constructor(
		startTime: number,
		endTime: number,
		obj: any,
		key: keyof any,
		targetVal: number,
	) {
		this.startTime = startTime
		this.endTime = endTime
		this.obj = obj
		this.key = key
		this.targetVal = targetVal

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		this.startVal = obj[key]
	}

	update(time: number) {
		const totalDuration = this.endTime - this.startTime
		// Specifically designed to end at the same time as any clock waits
		const inverseLerp = Math.max(0, (this.endTime - time) / totalDuration)

		// Accurate lerp
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		this.obj[this.key] = (this.startVal * inverseLerp) + (this.targetVal * (1 - inverseLerp))
	}

	shouldCleanUp(time: number) {
		return time >= this.endTime
	}

	classId() {
		return SerializableId.TWEEN
	}
}

function tweenRecursive<T>(tweens: Tween[], time: number, obj: T, target: TweenTarget<T>, duration: number, timeOffset: number): Tween[] {
	for (const key in target) {
		const targetVal = target[key]!

		if (typeof targetVal === "number") {
			// Remove any existing tweens on this value
			const existingTweenIdx = tweens.findIndex(existing => {
				return existing.obj === obj && existing.key === key
			})
			if (existingTweenIdx >= 0) tweens.splice(existingTweenIdx, 1)

			// Add new tween
			const offsetTime = time - timeOffset
			tweens.push(
				new Tween(
					offsetTime,
					offsetTime + duration,
					obj,
					key,
					targetVal
				)
			)
		} else {
			tweenRecursive(tweens, time, obj[key]!, targetVal, duration, timeOffset)
		}
	}
}

export class UiClock {
	private time = 0

	private tweens: Tween[] = []
	private waits: { finishTime: number, resolve: (excessTime: number) => void }[] = []

	update(dt: number) {
		this.time += dt

		// Update tweens
		this.tweens.forEach(tween => {
			tween.update(this.time)
		})
		this.tweens = this.tweens.filter(e => !e.shouldCleanUp(this.time))

		// Update waits
		this.waits = this.waits.filter(wait => {
			if (this.time < wait.finishTime) return true

			wait.resolve(this.time - wait.finishTime)
			return false
		})
	}

	/**
	 * Returns a promise that resolves after this clock has waited
	 * {@link duration} seconds.
	 * 
	 * @param duration The seconds to wait for.
	 * @param timeOffset The initial amount to fast forward the wait by.
	 * @return A promise that resolves after the wait with the excess time over
	 * the duration that has been waited for.
	 */
	wait(duration: number, timeOffset = 0): Promise<number> {
		return new Promise(resolve => {
			this.waits.push({ finishTime: this.time + duration - timeOffset, resolve })
		})
	}

	/**
	 * Tweens the values of a given object and its children objects.
	 * 
	 * Tweens are attached to the children objects directly.
	 * 
	 * @param obj The object to tween.
	 * @param target The target values to tween to.
	 * @param duration How long the tween will last.
	 * @param timeOffset The initial amount to fast forward the tween by.
	 * @return A promise which resolves when the duration has expired with the
	 * tween's excess seconds.
	 */
	tween<T>(obj: T, target: TweenTarget<T>, duration: number, timeOffset = 0): Promise<number> {
		tweenRecursive(this.tweens, this.time, obj, target, duration, timeOffset)

		return this.wait(duration, timeOffset)
	}

	getTime() { return this.time }
}

export class SerializableClock implements Serializable {
	private time = 0

	private tweens: Tween[] = []
	private waits: { finishTime: number, serializableCallback: SerializableCallback<any, [number]> }[] = []

	update(dt: number) {
		this.time += dt

		// Update tweens
		this.tweens.forEach(tween => {
			tween.update(this.time)
		})
		this.tweens = this.tweens.filter(e => !e.shouldCleanUp(this.time))

		// Update waits
		this.waits = this.waits.filter(wait => {
			if (this.time < wait.finishTime) return true

			const callback = wait.serializableCallback
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			callback[0][callback[1]](this.time - wait.finishTime)
			return false
		})
	}

	wait<C extends Serializable<any, any>>(duration: number, timeOffset = 0, serializableCallback: SerializableCallback<C, [number]>): void {
		this.waits.push({
			finishTime: this.time + duration - timeOffset,
			serializableCallback: serializableCallback as any
		})
	}

	tween<T, C extends Serializable<any, any>>(obj: T, target: TweenTarget<T>, duration: number, timeOffset = 0, serializableCallback: SerializableCallback<C, [number]>): void {
		tweenRecursive(this.tweens, this.time, obj, target, duration, timeOffset)

		this.wait(duration, timeOffset, serializableCallback)
	}

	getTime() { return this.time }

	classId(): SerializableId {
		return SerializableId.CLOCK
	}
}
