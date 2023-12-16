export {}

export function v2(x: number, y: number) {
	return [x, y] as V2
}

export function rect(x: number, y: number, w: number, h: number) {
	return [x, y, w, h] as Rect
}

export function rectFromV2s(pos: V2, size: V2) {
	return [...pos, ...size] as Rect
}

declare global {
	type V2 = [number, number]
	// type V3 = [...V2, number]
	// type V4 = [...V3, number]
	type MutV2 = Mut<V2>
	// type MutV3 = Mut<V3>
	// type MutV4 = Mut<V4>
	type Rect = [...V2, ...V2]
	type MutRect = Mut<Rect>

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
		equals(this: V2, o: V2): boolean
		set(this: MutV2, x: number, y: number): MutV2
		neg(this: MutV2): MutV2
		add(this: MutV2, o: V2): MutV2
		add2(this: MutV2, x: number, y: number): MutV2
		sub(this: MutV2, o: V2): MutV2
		mul(this: MutV2, s: number): MutV2
		mul2(this: MutV2, x: number, y: number): MutV2
		mulV2(this: MutV2, o: V2): MutV2
		inv(this: MutV2): MutV2
		dot(this: V2, o: V2): number
		mag(this: V2): number
		dist(this: V2, o: V2): number
		taxiDist(this: V2, o:V2): number
		normOr(this: MutV2, fallbackX: number, fallbackY: number): MutV2
		rot90(this: MutV2): MutV2
		rectArea(this: V2): number
		min(this: V2): number
		max(this: V2): number

		iAabbV2(this: Rect, v: V2): boolean
	}
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
Array.prototype.mut = function() { return this as any }
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
Array.prototype.lock = function() { return this as any }

Array.prototype.equals = function(o) {
	return this[0] === o[0] && this[1] === o[1]
}

Array.prototype.set = function(x, y) {
	this[0] = x
	this[1] = y

	return this
}

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

Array.prototype.add2 = function(x: number, y: number) {
	this[0] += x
	this[1] += y

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

Array.prototype.mul2 = function(x, y) {
	this[0] *= x
	this[1] *= y

	return this
}

Array.prototype.mulV2 = function(o) {
	return this.mul2(o[0], o[1])
}

Array.prototype.inv = function() {
	this[0] = 1/this[0]
	this[1] = 1/this[1]

	return this
}

Array.prototype.dot = function(o: V2) {
	return this[0] * o[0] + this[1] * o[1]
}

Array.prototype.mag = function() {
	return Math.sqrt(this[0] * this[0] + this[1] * this[1])
}

Array.prototype.dist = function(o: V2) {
	const diffX = this[0] - o[0]
	const diffY = this[1] - o[1]
	return Math.sqrt(diffX * diffX + diffY * diffY)
}

Array.prototype.taxiDist = function(o) {
	return Math.abs(this[0] - o[0]) + Math.abs(this[1] - o[1])
}

Array.prototype.normOr = function(x, y) {
	const mag = this.mag()
	if (mag === 0) {
		this[0] = x
		this[1] = y
		return this
	}

	this[0] /= mag
	this[1] /= mag

	return this
}

Array.prototype.rot90 = function() {
	[this[0], this[1]] = [-this[1], this[0]]

	return this
}

Array.prototype.rectArea = function() {
	return this[0] * this[1]
}

Array.prototype.min = function() {
	return Math.min(this[0], this[1])
}

Array.prototype.max = function() {
	return Math.max(this[0], this[1])
}

Array.prototype.iAabbV2 = function(v) {
	return v[0] >= this[0] && v[0] <= this[0] + this[2]
		&& v[1] >= this[1] && v[1] <= this[1] + this[3]
}
