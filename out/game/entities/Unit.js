import ArmyEntity from "./ArmyEntity.js";
export default class Unit extends ArmyEntity {
    vel;
    radius;
    angle = 0;
    path;
    lastDestination = null;
    baseUpdate(dt) {
    }
}
//# sourceMappingURL=Unit.js.map