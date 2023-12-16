import Anim from "../Anim.js";
import Unit from "./Unit.js";
export default class Marine extends Unit {
    constructor(args) {
        super({ ...args, initialAnimation: new Anim("marine", "idle") });
    }
    updateImpl(dt) {
        super.updateImpl(dt);
        const maxSpeed = this.getSpeed();
        const radius = this.getRadius();
        const speed = this.vel.mag();
        if (this.vel.mag() > maxSpeed * .1) {
            if (this.anim.animationName !== "move") {
                this.anim = new Anim("marine", "move");
            }
            this.anim.advance(speed / (radius * 2) * dt);
        }
        else {
            if (this.anim.animationName === "move")
                this.anim = new Anim("marine", "idle");
        }
    }
    getSpeed() {
        return 2;
    }
    getRadius() {
        return .4;
    }
    getMaxHealth() {
        return 40;
    }
    classId() {
        return 6;
    }
}
//# sourceMappingURL=Marine.js.map