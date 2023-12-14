Array.prototype.mut = function () { return this; };
Array.prototype.lock = function () { return this; };
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
Array.prototype.dot = function (o) {
    return this[0] * o[0] + this[1] * o[1];
};
Array.prototype.norm = function () {
    const len = this.dot(this);
    this[0] /= len;
    this[1] /= len;
    return this;
};
Array.prototype.rot90 = function () {
    [this[0], this[1]] = [-this[1], this[0]];
    return this;
};
Array.prototype.rectArea = function () {
    return this[0] * this[1];
};
export {};
//# sourceMappingURL=vector.js.map