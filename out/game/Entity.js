import { ctx } from "../context.js";
import { current } from "../engine/Provider.js";
import Game from "./Game.js";
export default class Entity {
    pos;
    anim;
    angle;
    constructor(args) {
        this.pos = args.pos;
        this.anim = args.initialAnimation;
        this.angle = args.angle;
    }
    baseUpdate(dt) {
        this.updateImpl(dt);
    }
    baseRender() {
        this.renderImpl();
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
    shouldCleanUp() { return false; }
    getCurrentSprite() {
        return this.anim.getSprite();
    }
}
//# sourceMappingURL=Entity.js.map