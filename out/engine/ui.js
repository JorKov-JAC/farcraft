import { canvas, ctx } from "../global.js";
import { createProviderKey, current, provide } from "./Provider.js";
import { v2 } from "./vector.js";
const containerPosKey = createProviderKey(v2(0, 0));
const containerSizeKey = createProviderKey(v2(canvas.width, canvas.height));
export class ScreenCoord {
    rootRect = v2(0, 0);
    rootSq = v2(0, 0);
    rect = v2(0, 0);
    sq = v2(0, 0);
    constructor() { }
    static rootRect(x, y) {
        const pos = new ScreenCoord();
        return pos.setRootRect(x, y);
    }
    static rootSq(x, y) {
        const pos = new ScreenCoord();
        return pos.setRootSq(x, y);
    }
    static rect(x, y) {
        const pos = new ScreenCoord();
        return pos.setRect(x, y);
    }
    static sq(x, y) {
        const pos = new ScreenCoord();
        return pos.setSq(x, y);
    }
    setRootRect(x, y) {
        this.rootRect.mut().set(x, y);
        return this;
    }
    setRootSq(x, y) {
        this.rootSq.mut().set(x, y);
        return this;
    }
    setRect(x, y) {
        this.rect.mut().set(x, y);
        return this;
    }
    setSq(x, y) {
        this.sq.mut().set(x, y);
        return this;
    }
    mut() { return this; }
    lock() { return this; }
    get canvasSize() {
        const containerSize = current(containerSizeKey);
        const minRootDimension = Math.min(canvas.width, canvas.height);
        return this.rootRect.slice().mul2(canvas.width, canvas.height)
            .add(this.rootSq.slice().mul(minRootDimension))
            .add(this.rect.slice().mulV2(containerSize))
            .add(this.sq.slice().mul(containerSize.min()));
    }
    get canvasPos() {
        const containerPos = current(containerPosKey);
        return this.canvasSize.mut().add(containerPos);
    }
}
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
    recompose() {
        this.actualPos = this.pos.canvasPos;
        this.actualSize = this.size.canvasSize;
        provide(containerPosKey, this.actualPos, () => {
            provide(containerSizeKey, this.actualSize, () => {
                this.children.forEach(e => { e.recompose(); });
            });
        });
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
    update(_dt) { }
    onClick() { }
}
//# sourceMappingURL=ui.js.map