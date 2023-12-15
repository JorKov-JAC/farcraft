import { Panel } from "./Panel.js";
export class Button extends Panel {
    beingHeld = false;
    clickCallback;
    constructor(clickCallback, pos, size) {
        super(pos, size);
        this.clickCallback = clickCallback;
    }
    onClick(pos) {
        super.onClick(pos);
        this.clickCallback();
    }
    onPress(pos) {
        super.onPress(pos);
        this.beingHeld = true;
    }
    onUnpress(pos) {
        super.onUnpress(pos);
        this.beingHeld = false;
    }
}
//# sourceMappingURL=Button.js.map