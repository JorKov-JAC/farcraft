class Tween {
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
}
export default class Clock {
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
        this.tweenRecursive(obj, target, duration, timeOffset);
        return this.wait(duration);
    }
    tweenRecursive(obj, target, duration, timeOffset) {
        for (const key in target) {
            const targetVal = target[key];
            if (typeof targetVal === "number") {
                const existingTweenIdx = this.tweens.findIndex(existing => {
                    return existing.obj === obj && existing.key === key;
                });
                if (existingTweenIdx >= 0)
                    this.tweens.splice(existingTweenIdx, 1);
                const offsetTime = this.time - timeOffset;
                this.tweens.push(new Tween(offsetTime, offsetTime + duration, obj, key, targetVal));
            }
            else {
                this.tweenRecursive(obj[key], targetVal, duration, timeOffset);
            }
        }
    }
}
//# sourceMappingURL=clock.js.map