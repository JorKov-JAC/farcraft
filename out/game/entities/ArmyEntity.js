import { ctx } from "../../context.js";
import { current } from "../../engine/Provider.js";
import Entity from "../Entity.js";
import Game from "../Game.js";
export default class ArmyEntity extends Entity {
    health = this.getMaxHealth();
    owner;
    pos;
    constructor(owner, pos) {
        super();
        this.owner = owner;
        this.pos = pos;
    }
    baseRender() {
        const game = current(Game);
        const camera = game.camera;
        const worldSizeToCanvasFactor = camera.worldSizeToCanvasFactor();
        const radius = this.getRadius();
        const selected = game.selectedEnts.has(this);
        if (selected) {
            ctx.save();
            ctx.strokeStyle = "#0F0";
            ctx.translate(...camera.worldPosToCanvas(this.pos).lock());
            ctx.scale(1, .5);
            ctx.arc(0, 0, radius * worldSizeToCanvasFactor, 0, Math.PI, true);
            ctx.restore();
        }
        this.renderImpl();
        if (selected) {
            ctx.save();
            ctx.strokeStyle = "#0F0";
            ctx.translate(...camera.worldPosToCanvas(this.pos).lock());
            ctx.scale(1, .5);
            ctx.arc(0, 0, radius * worldSizeToCanvasFactor, 0, Math.PI, false);
            ctx.restore();
        }
    }
    renderImpl() {
        const camera = current(Game).camera;
        const sprite = this.getCurrentSprite();
        const radius = this.getRadius();
        const spriteSize = sprite.sizeWithin(radius);
        const worldPos = this.pos.slice().add2(-spriteSize[0] / 2, -spriteSize[1]);
        const canvasPos = camera.worldPosToCanvas(worldPos).lock();
        sprite.render(...canvasPos, radius * camera.worldSizeToCanvasFactor());
    }
}
//# sourceMappingURL=ArmyEntity.js.map