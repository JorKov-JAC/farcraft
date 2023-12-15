import { Panel } from "../engine/ui/Panel.js";
export default class Camera extends Panel {
    game;
    worldPos;
    maxLen;
    constructor(uiPos, uiSize, game, pos, maxLen) {
        super(uiPos, uiSize);
        this.game = game;
        this.worldPos = pos.slice();
        this.maxLen = maxLen;
    }
}
//# sourceMappingURL=Camera.js.map