import { rectFromV2s } from "../vector.js";
import { UiClock } from "../clock.js";
export default class UiTree {
    panels = [];
    clock = new UiClock();
    mouseEventsToHandle = [];
    ongoingMouseHolds = [];
    update(dt) {
        this.clock.update(dt);
        this.panels.forEach(e => {
            e.baseUpdate(dt);
        });
        for (const child of this.descendantsBackward()) {
            if (this.mouseEventsToHandle.length <= 0)
                break;
            const actualPos = child.getActualPos();
            const actualSize = child.getActualSize();
            const childBounds = rectFromV2s(actualPos, actualSize);
            for (const handlableMouseEvent of this.mouseEventsToHandle) {
                const event = handlableMouseEvent.event;
                if (!childBounds.iAabbV2(event.pos))
                    continue;
                handlableMouseEvent.handled = true;
                switch (event.type) {
                    case 0: {
                        if (event.button === 0) {
                            child.onPress(event.pos);
                        }
                        else if (event.button === 1) {
                            child.onRightPress(event.pos);
                        }
                        this.ongoingMouseHolds.push({ button: event.button, panel: child });
                        break;
                    }
                    case 1: {
                        const childOngoingHolds = this.ongoingMouseHolds.filter(e => e.panel === child);
                        this.emptyOngoingMouseHolds(event);
                        if (event.button === 0) {
                            child.onDrop(event.pos);
                            childOngoingHolds
                                .find(e => e.button === 0)
                                ?.panel
                                .onClick(event.pos);
                        }
                        break;
                    }
                }
            }
            this.mouseEventsToHandle = this.mouseEventsToHandle.filter(e => !e.handled);
        }
        this.mouseEventsToHandle
            .filter(e => e.event.type === 1)
            .forEach(e => { this.emptyOngoingMouseHolds(e.event); });
        this.mouseEventsToHandle.length = 0;
    }
    render() {
        this.panels.forEach(e => {
            e.baseRender();
        });
    }
    emptyOngoingMouseHolds(mouseUpEvent) {
        this.ongoingMouseHolds = this.ongoingMouseHolds.filter(e => {
            if (e.button !== mouseUpEvent.button)
                return true;
            if (mouseUpEvent.button === 0) {
                e.panel.onUnpress(mouseUpEvent.pos);
            }
            return false;
        });
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