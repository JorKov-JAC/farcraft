import { ctx } from "../../context.js";
import { canvas } from "../../context.js";
import { createProviderKey, provide } from "../Provider.js";
import { v2 } from "../vector.js";
export const containerPosKey = createProviderKey(v2(0, 0));
export const containerSizeKey = createProviderKey(v2(canvas.width, canvas.height));
export class Panel {
    actualPos = v2(0, 0);
    actualSize = v2(0, 0);
    pos;
    size;
    children = [];
    constructor(pos, size) {
        this.pos = pos;
        this.size = size;
    }
    render() {
        ctx.save();
        ctx.beginPath();
        ctx.rect(...this.actualPos, ...this.actualSize);
        ctx.clip();
        provide(containerPosKey, this.actualPos, () => {
            provide(containerSizeKey, this.actualSize, () => {
                this.renderImpl();
            });
        });
        this.children.forEach(e => { e.render(); });
        ctx.restore();
    }
    update(dt) {
        this.actualPos = this.pos.canvasPos;
        this.actualSize = this.size.canvasSize;
        this.updateImpl(dt);
        this.actualPos = this.pos.canvasPos;
        this.actualSize = this.size.canvasSize;
        provide(containerPosKey, this.actualPos, () => {
            provide(containerSizeKey, this.actualSize, () => {
                this.children.forEach(e => { e.update(dt); });
            });
        });
    }
    *descendantsBackward() {
        for (let i = this.children.length; i-- > 0;) {
            const child = this.children[i];
            yield* child.descendantsBackward();
        }
        yield this;
    }
    getActualPos() {
        return this.actualPos;
    }
    getActualSize() {
        return this.actualSize;
    }
    updateImpl(_dt) { }
    onPress(_pos) { }
    onUnpress(_pos) { }
    onDrop(_pos) { }
    onClick(_pos) { }
}
//# sourceMappingURL=Panel.js.map