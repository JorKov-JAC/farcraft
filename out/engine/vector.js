export function v2(x, y) {
    return [x, y];
}
export function rect(x, y, w, h) {
    return [x, y, w, h];
}
export function rectFromV2s(pos, size) {
    return [...pos, ...size];
}
Array.prototype.mut = function () { return this; };
Array.prototype.lock = function () { return this; };
Array.prototype.equals = function (o) {
    return this[0] === o[0] && this[1] === o[1];
};
Array.prototype.set = function (x, y) {
    this[0] = x;
    this[1] = y;
    return this;
};
Array.prototype.neg = function () {
    this[0] = -this[0];
    this[1] = -this[1];
    return this;
};
Array.prototype.add = function (o) {
    this[0] += o[0];
    this[1] += o[1];
    return this;
};
Array.prototype.add2 = function (x, y) {
    this[0] += x;
    this[1] += y;
    return this;
};
Array.prototype.sub = function (o) {
    this[0] -= o[0];
    this[1] -= o[1];
    return this;
};
Array.prototype.mul = function (s) {
    this[0] *= s;
    this[1] *= s;
    return this;
};
Array.prototype.mul2 = function (x, y) {
    this[0] *= x;
    this[1] *= y;
    return this;
};
Array.prototype.mulV2 = function (o) {
    return this.mul2(o[0], o[1]);
};
Array.prototype.inv = function () {
    this[0] = 1 / this[0];
    this[1] = 1 / this[1];
    return this;
};
Array.prototype.dot = function (o) {
    return this[0] * o[0] + this[1] * o[1];
};
Array.prototype.mag = function () {
    return Math.sqrt(this[0] * this[0] + this[1] * this[1]);
};
Array.prototype.dist = function (o) {
    const diffX = this[0] - o[0];
    const diffY = this[1] - o[1];
    return Math.sqrt(diffX * diffX + diffY * diffY);
};
Array.prototype.taxiDist = function (o) {
    return Math.abs(this[0] - o[0]) + Math.abs(this[1] - o[1]);
};
Array.prototype.normOr = function (x, y) {
    const mag = this.mag();
    if (mag === 0) {
        this[0] = x;
        this[1] = y;
        return this;
    }
    this[0] /= mag;
    this[1] /= mag;
    return this;
};
Array.prototype.rot90 = function () {
    [this[0], this[1]] = [-this[1], this[0]];
    return this;
};
Array.prototype.rectArea = function () {
    return this[0] * this[1];
};
Array.prototype.min = function () {
    return Math.min(this[0], this[1]);
};
Array.prototype.max = function () {
    return Math.max(this[0], this[1]);
};
Array.prototype.iAabbV2 = function (v) {
    return v[0] >= this[0] && v[0] <= this[0] + this[2]
        && v[1] >= this[1] && v[1] <= this[1] + this[3];
};
//# sourceMappingURL=vector.js.map