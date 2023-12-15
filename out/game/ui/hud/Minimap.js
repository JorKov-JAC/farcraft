import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import { ctx } from "../../../global.js";
import TechPanel from "../TechPanel.js";
export default class Minimap extends TechPanel {
    renderImpl() {
        super.renderImpl();
        ctx.save();
        const height = ScreenCoord.sq(0, .2).canvasSize[1];
        ctx.fillStyle = "#0F0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = height + "px sans-serif";
        ctx.fillText("FarCraft", ...ScreenCoord.rect(.5, .5).canvasPos);
        ctx.restore();
    }
}
//# sourceMappingURL=Minimap.js.map