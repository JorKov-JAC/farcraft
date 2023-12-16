import { Panel } from "../../../engine/ui/Panel.js";
import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
export default class WorldPanel extends Panel {
    game;
    constructor(pos, size, game) {
        super(pos, size);
        this.game = game;
    }
    renderImpl() {
        this.game.render(...ScreenCoord.rect(0, 0).canvasPos, ...ScreenCoord.rect(1, 1).canvasSize);
    }
    onPress(pos) {
        this.game.startDrag(this.game.camera.canvasPosToWorld(pos));
    }
    onUnpress(pos) {
        this.game.stopDrag(this.game.camera.canvasPosToWorld(pos));
    }
    onRightPress(pos) {
        this.game.orderMove(this.game.camera.canvasPosToWorld(pos));
    }
}
//# sourceMappingURL=WorldPanel.js.map