import { rectFromV2s } from "../vector.js";
import Clock from "../clock.js";
export default class UiTree {
    panels = [];
    clock = new Clock();
    mouseEventsToHandle = [];
    ongoingMouseHolds = [];
    update(dt) {
        this.clock.update(dt);
        this.panels.forEach(e => {
            e.update(dt);
        });
        for (const child of this.descendantsBackward()) {
            if (this.mouseEventsToHandle.length <= 0)
                break;
            const actualPos = child.actualPos;
            const actualSize = child.actualSize;
            const childBounds = rectFromV2s(actualPos, actualSize);
            for (const handlableMouseEvent of this.mouseEventsToHandle) {
                const event = handlableMouseEvent.event;
                if (!childBounds.iAabbV2(event.pos))
                    continue;
                handlableMouseEvent.handled = true;
                switch (event.type) {
                    case 0: {
                        child.onPress(event.pos);
                        this.ongoingMouseHolds.push(child);
                        break;
                    }
                    case 1: {
                        const clickedChild = this.ongoingMouseHolds.find(e => e === child);
                        this.emptyOngoingMouseHolds(event);
                        child.onDrop(event.pos);
                        clickedChild?.onClick(event.pos);
                        break;
                    }
                }
            }
            this.mouseEventsToHandle = this.mouseEventsToHandle.filter(e => !e.handled);
        }
        const unhandledUpEvent = this.mouseEventsToHandle.find(e => e.event.type === 1);
        if (unhandledUpEvent) {
            this.emptyOngoingMouseHolds(unhandledUpEvent.event);
        }
        this.mouseEventsToHandle.length = 0;
    }
    render() {
        this.panels.forEach(e => {
            e.render();
        });
    }
    emptyOngoingMouseHolds(mouseUpEvent) {
        this.ongoingMouseHolds.forEach(e => {
            e.onUnpress(mouseUpEvent.pos);
        });
        this.ongoingMouseHolds.length = 0;
    }
    *descendantsBackward() {
        for (let i = this.panels.length; i-- > 0;) {
            const child = this.panels[i];
            const childBackward = child.descendantsBackward();
            yield* childBackward;
        }
    }
    addMouseEvent(event) {
        this.mouseEventsToHandle.push({
            event,
            handled: false
        });
    }
}
//# sourceMappingURL=UiTree.js.map