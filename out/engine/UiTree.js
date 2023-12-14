import { rectFromV2s, v2 } from "./vector.js";
export default class UiTree {
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
                    case 0: {
                        child.onPress();
                        this.ongoingMouseHolds.push(child);
                        break;
                    }
                    case 1: {
                        const clickedChild = this.ongoingMouseHolds.find(e => e === child);
                        this.emptyOngoingMouseHolds();
                        child.onDrop();
                        clickedChild?.onClick();
                        break;
                    }
                }
            }
            this.mouseEventsToHandle = this.mouseEventsToHandle.filter(e => !e.handled);
        }
        if (this.mouseEventsToHandle.some(e => e.type === 1)) {
            this.emptyOngoingMouseHolds();
        }
        this.mouseEventsToHandle.length = 0;
    }
    render() {
        this.panels.forEach(e => {
            e.render();
        });
    }
    emptyOngoingMouseHolds() {
        this.ongoingMouseHolds.forEach(e => {
            e.onUnpress();
        });
        this.ongoingMouseHolds.length = 0;
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
//# sourceMappingURL=UiTree.js.map