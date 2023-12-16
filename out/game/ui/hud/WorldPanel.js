import { Panel } from "../../../engine/ui/Panel.js";
import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import { keys, mousePos } from "../../../global.js";
export default class WorldPanel extends Panel {
    game;
    constructor(pos, size, game) {
        super(pos, size);
        this.game = game;
    }
    renderImpl() {
        this.game.render(...ScreenCoord.rect(0, 0).canvasPos, ...ScreenCoord.rect(1, 1).canvasSize);
    }
    updateImpl(dt) {
        super.updateImpl(dt);
        if (keys["a"]) {
            this.game.orderAttackMove(this.game.camera.canvasPosToWorld(mousePos));
        }
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