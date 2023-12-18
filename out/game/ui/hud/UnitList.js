import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import TechPanel from "../TechPanel.js";
import ArmyEntityCard from "./ArmyEntityCard.js";
export default class UnitList extends TechPanel {
    constructor(pos, size) {
        super(pos, size);
        this.addChildren(new ArmyEntityCard(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), null));
    }
}
//# sourceMappingURL=UnitList.js.map