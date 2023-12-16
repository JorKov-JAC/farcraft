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
            ctx.lineWidth = 2;
            ctx.translate(...camera.worldPosToCanvas(this.pos.slice().add2(0, radius * .5)).lock());
            ctx.scale(1, 3 / 8);
            ctx.beginPath();
            ctx.arc(0, 0, radius * worldSizeToCanvasFactor, 0, Math.PI, true);
            ctx.stroke();
            ctx.restore();
        }
        this.renderImpl();
        if (selected) {
            ctx.save();
            ctx.strokeStyle = "#0F0";
            ctx.lineWidth = 2;
            ctx.translate(...camera.worldPosToCanvas(this.pos.slice().add2(0, radius * .5)).lock());
            ctx.scale(1, 3 / 8);
            ctx.beginPath();
            ctx.arc(0, 0, radius * worldSizeToCanvasFactor, 0, Math.PI, false);
            ctx.stroke();
            ctx.restore();
        }
    }
    renderImpl() {
        const camera = current(Game).camera;
        const sprite = this.getCurrentSprite();
        const len = this.getRadius() * 2;
        const spriteSize = sprite.sizeWithin(len);
        const worldPos = this.pos.slice().add(spriteSize.slice().neg().mul(.5));
        const canvasPos = camera.worldPosToCanvas(worldPos).lock();
        sprite.render(...canvasPos, len * camera.worldSizeToCanvasFactor());
    }
}
//# sourceMappingURL=ArmyEntity.js.map