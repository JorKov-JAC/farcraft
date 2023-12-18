import { current, provide } from "../../../engine/Provider.js";
import { Button } from "../../../engine/ui/Button.js";
import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import SpritePanel from "../../../engine/ui/SpritePanel.js";
import { keys } from "../../../global.js";
import Game from "../../Game.js";
import ArmyEntity from "../../entities/ArmyEntity.js";
import TechPanel from "../TechPanel.js";
import HealthBar from "./HealthBar.js";
export default class ArmyEntityCard extends TechPanel {
    ent;
    wasClicked = null;
    constructor(pos, size, ent) {
        super(pos, size);
        this.ent = ent;
        const spritePanelContainer = new TechPanel(ScreenCoord.rect(.05, .05), ScreenCoord.rect(.9, .65));
        spritePanelContainer.addChildren(new SpritePanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), () => ent.anim.getSprite()));
        this.addChildren(spritePanelContainer, new HealthBar(ScreenCoord.rect(.05, 0.75), ScreenCoord.rect(.9, .20)), new Button(() => {
            this.wasClicked = { withShift: "Shift" in keys };
        }, ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1)));
    }
    baseUpdate(dt) {
        this.handleClick();
        provide(ArmyEntity, this.ent, () => {
            super.baseUpdate(dt);
        });
    }
    baseRender() {
        provide(ArmyEntity, this.ent, () => {
            super.baseRender();
        });
    }
    handleClick() {
        if (!this.wasClicked)
            return;
        const { withShift } = this.wasClicked;
        this.wasClicked = null;
        const game = current(Game);
        if (withShift) {
            game.setSelectedEnts(Array.from(game.getSelectedEnts()).filter(e => e !== this.ent));
        }
        else {
            game.setSelectedEnts([this.ent]);
        }
    }
}
//# sourceMappingURL=ArmyEntityCard.js.map