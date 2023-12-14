export type TweenTarget<T> = {
	[K in keyof T]?: T[K] extends number ? number : TweenTarget<T[K]>
}

class Tween {
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
}

export default class Clock {
	time = 0

	tweens: Tween[] = []
	waits: { finishTime: number, resolve: (excessTime: number) => void }[] = []

	update(dt: number) {
		this.time += dt

		this.tweens.forEach(tween => {
			tween.update(this.time)
		})
		this.tweens = this.tweens.filter(e => !e.shouldCleanUp(this.time))

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
	 * @return A promise that resolves after the wait with the excess time over
	 * the duration that has been waited for.
	 */
	wait(duration: number): Promise<number> {
		return new Promise(resolve => {
			this.waits.push({ finishTime: this.time + duration, resolve })
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
	 * @return A promise which resolves when the duration has expired with the
	 * tween's excess seconds.
	 */
	tween<T>(obj: T, target: TweenTarget<T>, duration: number): Promise<number> {
		this.tweenRecursive(obj, target, duration)

		return this.wait(duration)
	}

	private tweenRecursive<T>(obj: T, target: TweenTarget<T>, duration: number) {
		for (const key in target) {
			const targetVal = target[key]!

			if (typeof targetVal === "number") {
				// Remove any existing tweens on this value
				const existingTweenIdx = this.tweens.findIndex(existing => {
					return existing.obj === obj && existing.key === key
				})
				if (existingTweenIdx >= 0) this.tweens.splice(existingTweenIdx, 1)

				// Add new tween
				this.tweens.push(
					new Tween(
						this.time,
						this.time + duration,
						obj,
						key,
						targetVal
					)
				)
			} else {
				this.tweenRecursive(obj[key], targetVal, duration)
			}
		}
	}
}
