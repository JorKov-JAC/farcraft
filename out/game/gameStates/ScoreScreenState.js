import GameState from "../../engine/GameState.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import UiTree from "../../engine/ui/UiTree.js";
import { replaceUi } from "../../global.js";
import ScoreScreenPanel from "../ui/ScoreScreenPanel.js";
export default class ScoreScreenState extends GameState {
    remainingUnits;
    timeTaken;
    constructor(remainingUnits, timeTaken) {
        super();
        this.remainingUnits = remainingUnits;
        this.timeTaken = timeTaken;
    }
    update(_dt) { }
    enter() {
        const ui = new UiTree();
        ui.panels.push(new ScoreScreenPanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), this));
        replaceUi(ui);
    }
}
//# sourceMappingURL=ScoreScreenState.js.map