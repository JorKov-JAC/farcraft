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
        const sprite = this.getCurrentSprite();
        sprite.render(-sprite.size[0] / 2, -sprite.size[1]);
    }
}
//# sourceMappingURL=ArmyEntity.js.map