export {}

declare global {
	type V2 = [number, number]
	// type V3 = [...V2, number]
	// type V4 = [...V3, number]
	type MutV2 = Mut<V2>
	// type MutV3 = Mut<V3>
	// type MutV4 = Mut<V4>

	// type M3 = [...V3, ...V3, ...V3]
	// type M4 = [...V4, ...V4, ...V4, ...V4]
	// type MutM3 = Mut<M3>
	// type MutM4 = Mut<M4>

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface Array<T> {
		slice(this: V2): MutV2
		// slice(this: V3): MutV3
		// slice(this: V4): MutV4
		mut(this: V2): MutV2
		lock(this: MutV2): V2
		neg(this: MutV2): MutV2
		add(this: MutV2, o: V2): MutV2
		sub(this: MutV2, o: V2): MutV2
		mul(this: MutV2, s: number): MutV2
		dot(this: V2, o: V2): number
	}
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
Array.prototype.mut = function() { return this as any }
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
Array.prototype.lock = function() { return this as any }

Array.prototype.neg = function() {
	this[0] = -this[0]
	this[1] = -this[1]

	return this
}

Array.prototype.add = function(o: V2) {
	this[0] += o[0]
	this[1] += o[1]

	return this
}

Array.prototype.sub = function(o: V2) {
	this[0] -= o[0]
	this[1] -= o[1]

	return this
}

Array.prototype.mul = function(s: number) {
	this[0] *= s
	this[1] *= s

	return this
}

Array.prototype.dot = function(o: V2) {
	return this[0] * o[0] + this[1] * o[1]
}
