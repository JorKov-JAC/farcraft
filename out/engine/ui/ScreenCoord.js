import { canvas } from "../../context.js";
import { current } from "../Provider.js";
import { v2 } from "../vector.js";
import { containerSizeKey } from "./Panel.js";
import { containerPosKey } from "./Panel.js";
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
//# sourceMappingURL=ScreenCoord.js.map