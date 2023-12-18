import { canvas } from "../../context.js";
import { current } from "../Provider.js";
import { v2 } from "../vector.js";
import { containerSizeKey } from "./Panel.js";
import { containerPosKey } from "./Panel.js";
export class ScreenCoord {
    rootRect;
    rootSq;
    rect;
    sq;
    constructor(rootRect, rootSq, rect, sq) {
        this.rootRect = rootRect;
        this.rootSq = rootSq;
        this.rect = rect;
        this.sq = sq;
    }
    static rootRect(x, y) {
        return new ScreenCoord(v2(x, y), v2(0, 0), v2(0, 0), v2(0, 0));
    }
    static rootSq(x, y) {
        return new ScreenCoord(v2(0, 0), v2(x, y), v2(0, 0), v2(0, 0));
    }
    static rect(x, y) {
        return new ScreenCoord(v2(0, 0), v2(0, 0), v2(x, y), v2(0, 0));
    }
    static sq(x, y) {
        return new ScreenCoord(v2(0, 0), v2(0, 0), v2(0, 0), v2(x, y));
    }
    copy() {
        return new ScreenCoord(this.rootRect, this.rootSq, this.rect, this.sq);
    }
    addRootRect(x, y) {
        this.rootRect.mut().add2(x, y);
        return this;
    }
    addRootSq(x, y) {
        this.rootSq.mut().add2(x, y);
        return this;
    }
    addRect(x, y) {
        this.rect.mut().add2(x, y);
        return this;
    }
    addSq(x, y) {
        this.sq.mut().add2(x, y);
        return this;
    }
    mut() { return this; }
    lock() { return this; }
    get canvasSize() {
        const containerSize = current(containerSizeKey);
        const minRootDimension = Math.min(canvas.width, canvas.height);
        const res = this.rootRect.slice().mul2(canvas.width, canvas.height)
            .add(this.rootSq.slice().mul(minRootDimension))
            .add(this.rect.slice().mulV2(containerSize))
            .add(this.sq.slice().mul(containerSize.min()));
        res[0] = Math.max(0, res[0]);
        res[1] = Math.max(0, res[1]);
        return res;
    }
    get canvasPos() {
        const containerPos = current(containerPosKey);
        return this.canvasSize.mut().add(containerPos);
    }
}
//# sourceMappingURL=ScreenCoord.js.map