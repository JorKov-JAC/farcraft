import { canvas, ctx } from "../global.js";
import { createProviderKey, current, provide } from "./Provider.js";
import { rectFromV2s, v2 } from "./vector.js";
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
        this.updateImpl(dt);
        this.actualPos = this.pos.canvasPos;
        this.actualSize = this.size.canvasSize;
        provide(containerPosKey, this.actualPos, () => {
            provide(containerSizeKey, this.actualSize, () => {
                this.children.forEach(e => { e.update(dt); });
            });
        });
    }
    *childrenBackward() {
        for (let i = this.children.length; i-- > 0;) {
            const child = this.children[i];
            yield* child.childrenBackward();
        }
        yield this;
    }
    updateImpl(_dt) { }
    onPress() { }
    onUnpress() { }
    onDrop() { }
    onClick() { }
}
export class UiTree {
    panels = [];
    mouseEventsToHandle = [];
    ongoingMouseHolds = [];
    update(dt) {
        this.panels.forEach(e => {
            e.update(dt);
        });
        for (const child of this.childrenBackward()) {
            if (this.mouseEventsToHandle.length <= 0)
                break;
            const actualPos = child.actualPos;
            const actualSize = child.actualSize;
            const childBounds = rectFromV2s(actualPos, actualSize);
            for (const mouseEvent of this.mouseEventsToHandle) {
                if (!childBounds.aabbV2(mouseEvent.pos))
                    continue;
                mouseEvent.handled = true;
                switch (mouseEvent.type) {
                    case 0:
                        child.onPress();
                        console.log("Press handled by " + child);
                        break;
                    case 1:
                        this.ongoingMouseHolds.forEach(e => {
                            e.onUnpress();
                        });
                        child.onDrop();
                        this.ongoingMouseHolds.find(e => e === child)?.onClick();
                        this.ongoingMouseHolds.length = 0;
                        break;
                }
            }
            this.mouseEventsToHandle = this.mouseEventsToHandle.filter(e => !e.handled);
        }
        this.mouseEventsToHandle.length = 0;
    }
    render() {
        this.panels.forEach(e => {
            e.render();
        });
    }
    *childrenBackward() {
        for (let i = this.panels.length; i-- > 0;) {
            const child = this.panels[i];
            const childBackward = child.childrenBackward();
            yield* childBackward;
        }
    }
    addMouseEvent(event, type) {
        this.mouseEventsToHandle.push({
            type: type,
            pos: v2(event.offsetX, event.offsetY),
            handled: false
        });
    }
    mouseDown(event) {
        this.addMouseEvent(event, 0);
    }
    mouseUp(event) {
        this.addMouseEvent(event, 1);
    }
}
//# sourceMappingURL=hui.js.map