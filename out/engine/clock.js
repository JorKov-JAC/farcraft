export class Tween {
    startTime;
    endTime;
    obj;
    key;
    startVal;
    targetVal;
    constructor(startTime, endTime, obj, key, targetVal) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.obj = obj;
        this.key = key;
        this.targetVal = targetVal;
        this.startVal = obj[key];
    }
    update(time) {
        const totalDuration = this.endTime - this.startTime;
        const inverseLerp = Math.max(0, (this.endTime - time) / totalDuration);
        this.obj[this.key] = (this.startVal * inverseLerp) + (this.targetVal * (1 - inverseLerp));
    }
    shouldCleanUp(time) {
        return time >= this.endTime;
    }
    classId() {
        return 4;
    }
}
function tweenRecursive(tweens, time, obj, target, duration, timeOffset) {
    for (const key in target) {
        const targetVal = target[key];
        if (typeof targetVal === "number") {
            const existingTweenIdx = tweens.findIndex(existing => {
                return existing.obj === obj && existing.key === key;
            });
            if (existingTweenIdx >= 0)
                tweens.splice(existingTweenIdx, 1);
            const offsetTime = time - timeOffset;
            tweens.push(new Tween(offsetTime, offsetTime + duration, obj, key, targetVal));
        }
        else {
            tweenRecursive(tweens, time, obj[key], targetVal, duration, timeOffset);
        }
    }
}
export class UiClock {
    time = 0;
    tweens = [];
    waits = [];
    update(dt) {
        this.time += dt;
        this.tweens.forEach(tween => {
            tween.update(this.time);
        });
        this.tweens = this.tweens.filter(e => !e.shouldCleanUp(this.time));
        this.waits = this.waits.filter(wait => {
            if (this.time < wait.finishTime)
                return true;
            wait.resolve(this.time - wait.finishTime);
            return false;
        });
    }
    wait(duration, timeOffset = 0) {
        return new Promise(resolve => {
            this.waits.push({ finishTime: this.time + duration - timeOffset, resolve });
        });
    }
    tween(obj, target, duration, timeOffset = 0) {
        tweenRecursive(this.tweens, this.time, obj, target, duration, timeOffset);
        return this.wait(duration, timeOffset);
    }
    getTime() { return this.time; }
}
export class SerializableClock {
    time = 0;
    tweens = [];
    waits = [];
    update(dt) {
        this.time += dt;
        this.tweens.forEach(tween => {
            tween.update(this.time);
        });
        this.tweens = this.tweens.filter(e => !e.shouldCleanUp(this.time));
        this.waits = this.waits.filter(wait => {
            if (this.time < wait.finishTime)
                return true;
            const callback = wait.serializableCallback;
            callback[0][callback[1]](this.time - wait.finishTime);
            return false;
        });
    }
    wait(duration, timeOffset = 0, serializableCallback) {
        this.waits.push({
            finishTime: this.time + duration - timeOffset,
            serializableCallback: serializableCallback
        });
    }
    tween(obj, target, duration, timeOffset = 0, serializableCallback) {
        tweenRecursive(this.tweens, this.time, obj, target, duration, timeOffset);
        this.wait(duration, timeOffset, serializableCallback);
    }
    getTime() { return this.time; }
    classId() {
        return 3;
    }
}
//# sourceMappingURL=clock.js.map