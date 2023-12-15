import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
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
    renderImpl() {
        this.game.world.render(...ScreenCoord.rect(0, 0).canvasPos, ...ScreenCoord.rect(1, 1).canvasSize);
    }
}
//# sourceMappingURL=Camera.js.map