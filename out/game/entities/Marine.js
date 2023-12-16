import Anim from "../Anim.js";
import Unit from "./Unit.js";
export default class Marine extends Unit {
    target = null;
    constructor(args) {
        super({ ...args, initialAnimation: new Anim("marine", "idle") });
    }
    updateImpl(dt) {
        super.updateImpl(dt);
        const maxSpeed = this.getSpeed();
        const radius = this.getRadius();
        const speed = this.vel.mag();
        if (this.attackCooldown > 0) {
            if (this.anim.animationName !== "shoot") {
                this.anim = new Anim("marine", "shoot");
            }
            else {
                this.anim.advance(dt / this.getAttackTime());
            }
        }
        else if (this.vel.mag() > maxSpeed * .1) {
            if (this.anim.animationName !== "move") {
                this.anim = new Anim("marine", "move");
            }
            else {
                this.anim.advance(speed / (radius * 2) * dt);
            }
        }
        else {
            if (this.anim.animationName !== "idle") {
                this.anim = new Anim("marine", "idle");
            }
            else {
                this.anim.advance(dt);
            }
        }
    }
    getSpeed() {
        return 3;
    }
    getAttackRange() {
        return 5;
    }
    getAttackDamage() {
        return 8;
    }
    getAttackTime() {
        return 1;
    }
    getAttackSounds() {
        return ["pulseRifle1", "pulseRifle2"];
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