import { ctx } from "../../../context.js";
import { current } from "../../../engine/Provider.js";
import { Panel } from "../../../engine/ui/Panel.js";
import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import { clamp } from "../../../engine/util.js";
import ArmyEntity from "../../entities/ArmyEntity.js";
export default class HealthBar extends Panel {
    renderImpl() {
        const ent = current(ArmyEntity);
        const healthFract = clamp(ent.health / ent.getMaxHealth(), 0, 1);
        const red = Math.min(2 - healthFract * 2, 1) * 255;
        const green = Math.min(healthFract * 2 - 1, 1) * 255;
        ctx.save();
        ctx.fillStyle = `rgb(${red},${green},0)`;
        ctx.fillRect(...ScreenCoord.rect(0, 0).canvasPos, ...ScreenCoord.rect(healthFract, 1).canvasSize);
        ctx.restore();
    }
}
//# sourceMappingURL=HealthBar.js.map