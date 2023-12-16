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
        const sprite = this.getCurrentSprite();
        const selected = game.selectedEnts.has(this);
        if (selected) {
            ctx.save();
            ctx.translate(this.sprite, ctx.arc, ctx.restore());
        }
    }
    renderImpl() {
        const sprite = this.getCurrentSprite();
        sprite.render(-sprite.size[0] / 2, -sprite.size[1]);
    }
}
//# sourceMappingURL=ArmyEntity.js.map