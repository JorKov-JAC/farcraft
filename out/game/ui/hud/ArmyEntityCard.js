import { provide } from "../../../engine/Provider.js";
import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import SpritePanel from "../../../engine/ui/SpritePanel.js";
import ArmyEntity from "../../entities/ArmyEntity.js";
import TechPanel from "../TechPanel.js";
import HealthBar from "./HealthBar.js";
export default class ArmyEntityCard extends TechPanel {
    ent;
    constructor(pos, size, ent) {
        super(pos, size);
        this.ent = ent;
        const spritePanelContainer = new TechPanel(ScreenCoord.rect(.05, .05), ScreenCoord.rect(.9, .65));
        spritePanelContainer.addChildren(new SpritePanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), () => ent.anim.getSprite()));
        this.addChildren(spritePanelContainer, new HealthBar(ScreenCoord.rect(.05, 0.75), ScreenCoord.rect(.9, .20)));
    }
    baseUpdate(dt) {
        provide(ArmyEntity, this.ent, () => {
            super.baseUpdate(dt);
        });
    }
    baseRender() {
        provide(ArmyEntity, this.ent, () => {
            super.baseRender();
        });
    }
}
//# sourceMappingURL=ArmyEntityCard.js.map