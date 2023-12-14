import { Panel } from "../../engine/ui.js";
export class Button extends Panel {
    beingHeld = false;
    clickCallback;
    constructor(clickCallback, pos, size) {
        super(pos, size);
        this.clickCallback = clickCallback;
    }
    onClick() {
        super.onClick();
        this.clickCallback();
    }
    onPress() {
        super.onPress();
        this.beingHeld = true;
    }
    onUnpress() {
        super.onUnpress();
        this.beingHeld = false;
    }
}
//# sourceMappingURL=Button.js.map