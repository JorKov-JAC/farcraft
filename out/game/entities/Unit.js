import { v2 } from "../../engine/vector.js";
import { images } from "../../global.js";
import ArmyEntity from "./ArmyEntity.js";
export default class Unit extends ArmyEntity {
    vel = v2(0, 0);
    angle = 0;
    pathBackward = [];
    lastDestination = this.pos.slice();
    updateImpl(dt) {
        const speed = this.getSpeed();
        const path = this.pathBackward;
        if (this.pathBackward.length > 0
            && this.pos.slice().floor().equals(path[path.length - 1]))
            path.pop();
        if (this.pathBackward.length > 0) {
            const nextPath = path[path.length - 1];
            this.vel.mut().set(...nextPath.slice().sub(this.pos).normOr(0, 0).mul(speed).lock());
        }
        this.pos.mut().add(this.vel.slice().mul(dt));
        this.angle = this.vel.radians();
    }
    startMovingTo(dest, world) {
        this.pathBackward = world.pathfindBackward(this.pos, dest) ?? [];
        if (this.pathBackward) {
            this.lastDestination = dest.slice();
        }
        else {
            this.lastDestination = this.pos.slice();
        }
    }
    getCurrentSprite() {
        return images.getAnim("marine", "idle").frames[0];
    }
}
//# sourceMappingURL=Unit.js.map