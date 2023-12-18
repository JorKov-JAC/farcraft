import { ctx } from "../../context.js";
import { current } from "../../engine/Provider.js";
import { rect, v2 } from "../../engine/vector.js";
import { gameSounds } from "../../global.js";
import Game from "../Game.js";
import ArmyEntity from "./ArmyEntity.js";
export default class Unit extends ArmyEntity {
    vel = v2(0, 0);
    angle = 0;
    pathBackward = [];
    lastCommandId = 0;
    target = null;
    attackCooldown = 0;
    command = 0;
    takeDamage(amount, source) {
        super.takeDamage(amount, source);
        if (!this.target)
            this.target = source;
    }
    updateImpl(dt) {
        this.attackCooldown -= dt;
        const world = current(Game).world;
        const speed = this.getSpeed();
        const radius = this.getRadius();
        const aabb = rect(this.pos[0] - radius, this.pos[1] - radius, this.pos[0] + radius, this.pos[1] + radius);
        let collidedWithWall = false;
        for (let y = Math.floor(this.pos[1] - radius); y < Math.ceil(this.pos[1] + radius); ++y) {
            for (let x = Math.floor(this.pos[0] - radius); x < Math.ceil(this.pos[0] + radius); ++x) {
                if (!world.isSolid(x, y))
                    continue;
                collidedWithWall = true;
                if (aabb.iAabb4(x, y, 1, 1)) {
                    const inLeft = x + 1 - this.pos[0] + radius;
                    const inRight = this.pos[0] + radius - x;
                    const inUp = y + 1 - this.pos[1] + radius;
                    const inDown = this.pos[1] + radius - y;
                    const smallest = Math.min(inLeft, inRight, inUp, inDown);
                    if (inLeft === smallest)
                        this.pos[0] += inLeft;
                    else if (inRight === smallest)
                        this.pos[0] -= inRight;
                    else if (inUp === smallest)
                        this.pos[1] += inUp;
                    else
                        this.pos[1] -= inDown;
                }
            }
        }
        if (this.target && this.target.health <= 0)
            this.target = null;
        const attackRange = this.getAttackRange();
        if (!this.target && this.command !== 1) {
            for (const e of world.unitsWithinBoundsInclusive(this.pos[0] - attackRange, this.pos[1] - attackRange, this.pos[0] + attackRange, this.pos[1] + attackRange)) {
                if (this.owner === e.owner || e.owner === 3)
                    continue;
                if (this.pos.dist(e.pos) <= attackRange && !world.isRayObstructed(this.pos, e.pos)) {
                    this.target = e;
                }
            }
        }
        if (this.command === 1)
            this.target = null;
        if (this.target) {
            const dist = this.pos.dist(this.target.pos);
            if (dist > attackRange || world.isRayObstructed(this.pos, this.target.pos)) {
                if (this.command === 0) {
                    this.commandAttackMoveTo(this.target.pos, world, Math.random());
                }
                else {
                    this.target = null;
                }
            }
            else {
                if (this.attackCooldown <= 0) {
                    this.target.takeDamage(this.getAttackDamage(), this);
                    this.angle = this.target.pos.slice().sub(this.pos).radians();
                    this.attackCooldown = this.getAttackTime();
                    const attackSounds = this.getAttackSounds();
                    const sound = attackSounds[Math.floor(Math.random() * attackSounds.length)];
                    void gameSounds.playSound(sound);
                }
            }
        }
        if (this.pathBackward.length > 0
            && (this.pos.slice().sub(this.pathBackward[this.pathBackward.length - 1]).mag() <= radius
                || collidedWithWall
                    && this.pathBackward.length === 1
                    && this.pos.slice().floor().equals(this.pathBackward[0].slice().floor())))
            this.pathBackward.pop();
        const velTowardNode = v2(0, 0).mut();
        if (this.attackCooldown <= 0) {
            if (this.pathBackward.length > 0) {
                const targetNode = this.pathBackward[this.pathBackward.length - 1];
                velTowardNode.set(...targetNode.slice().sub(this.pos).normOr(0, 0).mul(speed).lock());
                this.angle = this.vel.radians();
            }
            else {
                this.command = 0;
            }
        }
        const pushVel = v2(0, 0).mut();
        for (const e of world.unitsWithinBoundsInclusive(...aabb)) {
            if (e === this)
                continue;
            const dist = this.pos.dist(e.pos);
            const otherRadius = e.getRadius();
            const pushFactor = Math.max(0, 1 - (dist - otherRadius) / radius);
            const jiggle = Math.random() * .0001;
            const away = this.pos
                .slice()
                .sub(e.pos)
                .normOr(Math.random(), Math.random());
            const pushSpeed = speed * pushFactor;
            pushVel.add(away
                .mul(pushSpeed)
                .add(away.slice().rot90().mul(jiggle)));
            if (pushSpeed * -pushVel.dot(velTowardNode) >= speed && this.pathBackward.length > 0 && e.pathBackward.length === 0 && this.lastCommandId === e.lastCommandId) {
                this.pathBackward.length = 0;
                velTowardNode.set(0, 0);
                this.command = 0;
            }
        }
        this.vel.mut().set(...velTowardNode.lock()).add(pushVel);
        if (this.vel.mag() > speed)
            this.vel.mut().normOr(0, 0).mul(speed);
        this.pos.mut().add(this.vel.slice().mul(dt));
    }
    startMovingTo(dest, world, commandId, commandType) {
        const pathBackward = world.pathfindBackward(this.pos, dest);
        if (pathBackward) {
            pathBackward.pop();
            pathBackward.forEach(e => e.add2(.5, .5));
            pathBackward.splice(0, 0, dest.slice());
            this.pathBackward = pathBackward;
            this.lastCommandId = commandId;
            this.command = commandType;
        }
        else {
            this.pathBackward = [];
            this.lastCommandId = 0;
            this.command = 0;
        }
    }
    commandMoveTo(dest, world, commandId) {
        this.startMovingTo(dest, world, commandId, 1);
    }
    commandAttackMoveTo(dest, world, commandId) {
        this.startMovingTo(dest, world, commandId, 2);
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
}
//# sourceMappingURL=Unit.js.map