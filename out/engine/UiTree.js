import { rectFromV2s } from "./vector.js";
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
            for (const handlableMouseEvent of this.mouseEventsToHandle) {
                const event = handlableMouseEvent.event;
                if (!childBounds.aabbV2(event.pos))
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
    *childrenBackward() {
        for (let i = this.panels.length; i-- > 0;) {
            const child = this.panels[i];
            const childBackward = child.childrenBackward();
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