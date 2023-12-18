import { current } from "../../../engine/Provider.js";
import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import Game from "../../Game.js";
import TechPanel from "../TechPanel.js";
import ArmyEntityCard from "./ArmyEntityCard.js";
export default class UnitList extends TechPanel {
    static COLUMNS = 6;
    static MIN_ROWS = 2;
    currentCards = new Map();
    baseUpdate(dt) {
        const game = current(Game);
        this.updateCards(game.getSelectedEnts());
        super.baseUpdate(dt);
    }
    updateCards(entsIter) {
        const ents = Array.from(entsIter);
        const rows = Math.max(UnitList.MIN_ROWS, Math.ceil(ents.length / UnitList.COLUMNS));
        const missingEnts = new Set(this.currentCards.keys());
        for (const e of ents) {
            if (missingEnts.delete(e))
                continue;
            const card = new ArmyEntityCard(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), e);
            this.currentCards.set(e, card);
            this.addChildren(card);
        }
        for (const e of missingEnts.keys()) {
            const card = this.currentCards.get(e);
            this.currentCards.delete(e);
            this.removeChild(card);
        }
        const cards = Array.from(this.currentCards.values());
        for (let i = 0; i < cards.length; ++i) {
            const card = cards[i];
            card.pos.mut().reset().addRect(i % UnitList.COLUMNS / UnitList.COLUMNS, Math.floor(i / UnitList.COLUMNS) / rows);
            card.size.mut().reset().addRect(1 / UnitList.COLUMNS, 1 / rows);
        }
    }
}
//# sourceMappingURL=UnitList.js.map