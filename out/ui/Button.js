import { Panel } from "../engine/ui.js";
export class Button extends Panel {
    clickHandler;
    constructor(clickCallback, pos, size) {
        super(pos, size);
        this.clickHandler = clickCallback;
    }
    onClick() {
        super.onClick();
        this.onClick();
    }
}
//# sourceMappingURL=Button.js.map