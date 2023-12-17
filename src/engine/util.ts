export function irlDelay(ms: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}

export function rangeArray(a: number, b?: number, step = 1): number[] {
	if (step === 0) return []

	let start, stop

	if (b !== undefined) {
		start = a
		stop = b
	} else {
		start = 0
		stop = a
	}

	const result: number[] = []
	if (step > 0) {
		for (let i = start; i < stop; i += step) {
			result.push(i)
		}
	} else {
		for (let i = start; i > stop; i += step) {
			result.push(i)
		}
	}

	return result
}

export function spanArray(start: number, length: number): number[] {
	return rangeArray(start, start + length, length < 0 ? -1 : 1)
}

export function repeat<T>(val: T, times: number): T[] {
	const res = []
	for (let i = 0; i < times; ++i) res.push(val)
	return res
}

export function clamp(val: number, min: number, max: number): number {
	return Math.min(Math.max(min, val), max)
}

/** Allows throw to be used as an expression. */
export function raise(error: Error): never {
	throw error
}

export function mod(a: number, b: number) {
	return (a % b + b) % b
}
