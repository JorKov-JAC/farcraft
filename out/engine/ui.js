import { canvas } from "../global.js";
import { createProviderKey, current } from "./Provider.js";
import { v2 } from "./vector.js";
const containerSizeKey = createProviderKey(v2(canvas.width, canvas.height));
class ScreenPos {
    rect = v2(0, 0);
    sq = v2(0, 0);
    relRect = v2(0, 0);
    relSq = v2(0, 0);
    constructor() { }
    static rect(rect) {
        const pos = new ScreenPos();
        return pos.setRect(rect);
    }
    static sq(sq) {
        const pos = new ScreenPos();
        return pos.setSq(sq);
    }
    static relRect(relRect) {
        const pos = new ScreenPos();
        return pos.setRelRect(relRect);
    }
    static relSq(relSq) {
        const pos = new ScreenPos();
        return pos.setRelSq(relSq);
    }
    setRect(rect) {
        this.rect = rect.slice();
        return this;
    }
    setSq(sq) {
        this.sq = sq.slice();
        return this;
    }
    setRelRect(relRect) {
        this.relRect = relRect.slice();
        return this;
    }
    setRelSq(relSq) {
        this.relSq = relSq.slice();
        return this;
    }
    mut() { return this; }
    lock() { return this; }
    get pos() {
        const containerSize = current(containerSizeKey);
        const minRootDimension = Math.min(canvas.width, canvas.height);
        return this.rect.slice().mul2(canvas.width, canvas.height)
            .add(this.sq.slice().mul(minRootDimension))
            .add(this.relRect.slice().mulV2(containerSize))
            .add(this.relSq.slice().mul(containerSize.min()));
    }
}
//# sourceMappingURL=ui.js.map