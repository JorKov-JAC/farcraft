import { mod } from "../engine/util.js";
import { images } from "../global.js";
export default class Animation {
    groupName;
    animationName;
    frameTime;
    constructor(groupName, animationName, frameTime) {
        this.groupName = groupName;
        this.animationName = animationName;
        this.frameTime = frameTime;
    }
    advance(dFrameTime) {
        this.frameTime += dFrameTime;
        this.frameTime = mod(this.frameTime, this.getDuration());
    }
    getAnim() {
        return images.getAnim(this.groupName, this.animationName);
    }
    getDuration() {
        const anim = this.getAnim();
        if ("duration" in anim) {
            return anim.duration;
        }
        return anim.frames.length;
    }
    getSprite() {
        const anim = this.getAnim();
        const idx = this.frameTime / this.getDuration() * anim.frames.length;
        return anim.frames[idx];
    }
    classId() {
        return 5;
    }
}
//# sourceMappingURL=Animation.js.map