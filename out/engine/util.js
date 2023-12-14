export function irlDelay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
export function rangeArray(a, b, step = 1) {
    if (step === 0)
        return [];
    let start, stop;
    if (b !== undefined) {
        start = a;
        stop = b;
    }
    else {
        start = 0;
        stop = a;
    }
    const result = [];
    if (step > 0) {
        for (let i = start; i < stop; i += step) {
            result.push(i);
        }
    }
    else {
        for (let i = start; i > stop; i += step) {
            result.push(i);
        }
    }
    return result;
}
export function spanArray(start, length) {
    return rangeArray(start, start + length, length < 0 ? -1 : 1);
}
export function raise(error) {
    throw error;
}
//# sourceMappingURL=util.js.map