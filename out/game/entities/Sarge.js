import Anim from "../Anim.js";
import Unit from "./Unit.js";
export default class Marine extends Unit {
    constructor(args) {
        super({ ...args, initialAnimation: new Anim("sarge", "idle") });
    }
    updateImpl(dt) {
        super.updateImpl(dt);
        const maxSpeed = this.getSpeed();
        const radius = this.getRadius();
        const speed = this.vel.mag();
        if (this.attackCooldown > 0) {
            if (this.anim.animationName !== "shoot") {
                this.anim = new Anim("sarge", "shoot");
            }
            else {
                this.anim.setNorm(1 - this.attackCooldown / this.getAttackTime());
            }
        }
        else if (this.vel.mag() > maxSpeed * .1) {
            if (this.anim.animationName !== "move") {
                this.anim = new Anim("sarge", "move");
            }
            else {
                this.anim.advance(speed / (radius * 2) * dt);
            }
        }
        else {
            if (this.anim.animationName !== "idle") {
                this.anim = new Anim("sarge", "idle");
            }
            else {
                this.anim.advance(dt);
            }
        }
    }
    getSpeed() {
        return 2.5;
    }
    getAttackRange() {
        return 4;
    }
    getAttackDamage() {
        return 12;
    }
    getAttackTime() {
        return 1;
    }
    getAttackSounds() {
        return ["laserCannon1", "laserCannon2"];
    }
    getDeathSound() {
        return "sargeDeath";
    }
    getRadius() {
        return .5;
    }
    getMaxHealth() {
        return 60;
    }
    classId() {
        return 8;
    }
}
//# sourceMappingURL=Sarge.js.map