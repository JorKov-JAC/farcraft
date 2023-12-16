import { ctx } from "../../context.js";
import { current } from "../../engine/Provider.js";
import { v2 } from "../../engine/vector.js";
import { images } from "../../global.js";
import Game from "../Game.js";
import ArmyEntity from "./ArmyEntity.js";
export default class Unit extends ArmyEntity {
    vel = v2(0, 0);
    angle = 0;
    pathBackward = [];
    lastDestination = this.pos.slice();
    updateImpl(dt) {
        const world = current(Game).world;
        const speed = this.getSpeed();
        const radius = this.getRadius();
        const path = this.pathBackward;
        if (this.pathBackward.length > 0
            && this.pos.slice().add2(-.5, -.5).sub(path[path.length - 1]).mag() <= radius)
            path.pop();
        const velTowardNode = v2(0, 0).mut();
        if (this.pathBackward.length > 0) {
            const targetNode = path[path.length - 1];
            velTowardNode.set(...targetNode.slice().add2(.5, .5).sub(this.pos).normOr(0, 0).mul(speed).lock());
            this.angle = this.vel.radians();
        }
        const pushVel = v2(0, 0).mut();
        for (const e of world.unitsWithinBoundsInclusive(this.pos[0] - radius, this.pos[1] - radius, this.pos[0] + radius, this.pos[1] + radius)) {
            if (e === this)
                continue;
            const dist = this.pos.dist(e.pos);
            const otherRadius = e.getRadius();
            const pushFactor = Math.max(0, 1 - (dist - otherRadius) / radius);
            pushVel.add(this.pos
                .slice()
                .sub(e.pos)
                .normOr(Math.random(), Math.random())
                .mul(speed * pushFactor));
            const dest = this.pathBackward[0];
            if (pushFactor > .25 && dest && e.pathBackward.length === 0 && dest.dist(e.lastDestination) < .1) {
                this.pathBackward.length = 0;
                velTowardNode.set(0, 0);
            }
        }
        this.vel.mut().set(...velTowardNode.lock()).add(pushVel);
        if (this.vel.mag() > speed)
            this.vel.mut().normOr(0, 0).mul(speed);
        this.pos.mut().add(this.vel.slice().mul(dt));
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
    renderImpl() {
        ctx.save();
        const camera = current(Game).camera;
        const sprite = this.getCurrentSprite();
        const len = this.getRadius() * 2;
        const spriteSize = sprite.sizeWithin(len);
        const worldPos = this.pos.slice();
        const canvasPos = camera.worldPosToCanvas(worldPos).lock();
        ctx.translate(...canvasPos);
        if (this.angle > Math.PI * .5 && this.angle < Math.PI * 1.5) {
            ctx.scale(-1, 1);
        }
        else {
        }
        ctx.translate(...spriteSize.slice().neg().mul(.5 * camera.worldSizeToCanvasFactor()).lock());
        sprite.render(0, 0, len * camera.worldSizeToCanvasFactor());
        ctx.restore();
    }
    getCurrentSprite() {
        return images.getAnim("marine", "idle").frames[0];
    }
}
//# sourceMappingURL=Unit.js.map