import { SerializableClock } from "../../engine/clock.js";
import { images } from "../../global.js";
import Anim from "../Anim.js";
import Entity from "../Entity.js";
export default class Corpse extends Entity {
    clock;
    base;
    done;
    constructor(base) {
        const animGroupName = base.anim.groupName;
        let anim;
        let done = false;
        const dieAnimName = "die";
        if (images.hasAnim(animGroupName, dieAnimName)) {
            anim = new Anim(animGroupName, dieAnimName);
        }
        else {
            anim = base.anim;
            done = true;
        }
        super({ pos: base.pos, angle: base.angle, initialAnimation: anim });
        this.base = base;
        this.done = done;
        this.clock = new SerializableClock();
        this.clock.wait(anim.getDuration(), 0, [this, "markAsDone"]);
    }
    updateImpl(dt) {
        this.anim.advance(dt);
        this.clock.update(dt);
    }
    renderImpl() {
        if (this.done)
            return;
        super.renderImpl();
    }
    shouldCleanUp() {
        return this.done;
    }
    getRadius() {
        return this.base.getRadius();
    }
    markAsDone() {
        this.done = true;
    }
    classId() {
        return 6;
    }
}
//# sourceMappingURL=Corpse.js.map