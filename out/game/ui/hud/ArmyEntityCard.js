import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import SpritePanel from "../../../engine/ui/SpritePanel.js";
import { images } from "../../../global.js";
import TechPanel from "../TechPanel.js";
export default class ArmyEntityCard extends TechPanel {
    ent;
    constructor(pos, size, ent) {
        super(pos, size);
        this.ent = ent;
        this.addChildren(new SpritePanel(ScreenCoord.sq(0, 0), ScreenCoord.sq(1, 1), () => images.getAllSprites("marine")[4]));
    }
}
//# sourceMappingURL=ArmyEntityCard.js.map