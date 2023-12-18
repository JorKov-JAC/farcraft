import { Panel } from "./Panel.js";
import { ScreenCoord } from "./ScreenCoord.js";
export default class SpritePanel extends Panel {
    getSprite;
    constructor(pos, size, getSprite) {
        super(pos, size);
        this.getSprite = getSprite;
    }
    renderImpl() {
        const sprite = this.getSprite();
        const spriteAspectRatio = sprite.size[0] / sprite.size[1];
        const panelCanvasSize = ScreenCoord.rect(1, 1).canvasSize;
        const panelAspectRatio = panelCanvasSize[0] / panelCanvasSize[1];
        let w, h;
        if (panelAspectRatio > spriteAspectRatio) {
            h = panelCanvasSize[1];
            w = h * spriteAspectRatio;
        }
        else {
            w = panelCanvasSize[0];
            h = w / spriteAspectRatio;
        }
        sprite.render(...ScreenCoord.rect(.5, .5).canvasPos.mut().add2(-w * .5, -h * .5).lock(), Math.max(w, h));
    }
}
//# sourceMappingURL=SpritePanel.js.map