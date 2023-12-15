import Entity from "../Entity.js";
export default class ArmyEntity extends Entity {
    health = this.getMaxHealth();
    owner;
    pos;
    constructor(owner, pos) {
        super();
        this.owner = owner;
        this.pos = pos;
    }
}
//# sourceMappingURL=ArmyEntity.js.map