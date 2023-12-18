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
    _trueChildren = [];
    constructor(pos, size) {
        this.pos = pos;
        this.size = size;
    }
    baseRender() {
        ctx.save();
        ctx.beginPath();
        ctx.rect(...this.actualPos, ...this.actualSize);
        ctx.clip();
        provide(containerPosKey, this.actualPos, () => {
            provide(containerSizeKey, this.actualSize, () => {
                this.renderImpl();
            });
        });
        this._trueChildren.forEach(e => { e.baseRender(); });
        ctx.restore();
    }
    baseUpdate(dt) {
        this.actualPos = this.pos.canvasPos;
        this.actualSize = this.size.canvasSize;
        this.updateImpl(dt);
        this.actualPos = this.pos.canvasPos;
        this.actualSize = this.size.canvasSize;
        provide(containerPosKey, this.actualPos, () => {
            provide(containerSizeKey, this.actualSize, () => {
                this._trueChildren.forEach(e => { e.baseUpdate(dt); });
            });
        });
    }
    *descendantsBackward() {
        for (let i = this._trueChildren.length; i-- > 0;) {
            const child = this._trueChildren[i];
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
    getPublicChildren() {
        return this._trueChildren;
    }
    getChildren() {
        return this.getPublicChildren();
    }
    addChildren(...children) {
        this.getPublicChildren().push(...children);
    }
    removeChild(child) {
        const publicChildren = this.getPublicChildren();
        const idx = publicChildren.indexOf(child);
        if (idx >= 0) {
            publicChildren.splice(idx, 1);
        }
    }
    renderImpl() { }
    updateImpl(_dt) { }
    onPress(_pos) { }
    onUnpress(_pos) { }
    onDrop(_pos) { }
    onClick(_pos) { }
    onRightPress(_pos) { }
}
//# sourceMappingURL=Panel.js.map