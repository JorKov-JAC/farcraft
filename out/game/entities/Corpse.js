import ArmyEntity from "./ArmyEntity.js";
export default class Corpse extends ArmyEntity {
    radius;
    timeRemaining;
    constructor(pos, radius, anim) {
        super({ pos, owner: 3, initialAnimation: anim });
        this.radius = radius;
        this.timeRemaining = anim.getDuration();
    }
    updateImpl(dt) {
        this.timeRemaining -= dt;
        this.anim.advance(dt);
    }
    shouldCleanUp() {
        return this.timeRemaining <= 0;
    }
    getRadius() {
        return this.radius;
    }
}
//# sourceMappingURL=Corpse.js.map