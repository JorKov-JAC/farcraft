import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
import { Panel } from "../engine/ui/Panel.js";
export default class Camera extends Panel {
    game;
    worldPos;
    minLen;
    extraYMult = 0;
    speed = 1.5;
    constructor(uiPos, uiSize, game, pos, minLen) {
        super(uiPos, uiSize);
        this.game = game;
        this.worldPos = pos.slice();
        this.minLen = minLen;
    }
    renderImpl() {
        this.game.world.render(...ScreenCoord.rect(0, 0).canvasPos, ...ScreenCoord.rect(1, 1).canvasSize, ...this.worldPos, this.minLen);
    }
    updateImpl(dt) {
        const actualSize = this.getActualSize();
        const vMin = Math.min(actualSize[0], actualSize[1]);
        const scale = this.minLen / vMin;
        const tilemap = this.game.world.tilemap;
        this.worldPos[0] = Math.min(Math.max(0, this.worldPos[0]), tilemap.width - actualSize[0] * scale);
        this.worldPos[1] = Math.min(Math.max(0, this.worldPos[1]), tilemap.height - actualSize[1] * scale * (1 - this.extraYMult));
    }
    onPress(pos) {
        this.game.startDrag(pos);
    }
    onUnpress(pos) {
        this.game.stopDrag(pos);
    }
    moveBy(v, dt) {
        this.worldPos.mut().add(v.slice().mul(this.speed * this.minLen * dt));
    }
}
//# sourceMappingURL=Camera.js.map