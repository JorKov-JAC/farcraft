import { ctx } from "../../context.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import { gameStateManager } from "../../global.js";
import MainMenuState from "../gameStates/MainMenuState.js";
import TechPanel from "./TechPanel.js";
import TextButton from "./buttons/TextButton.js";
export default class ScoreScreenPanel extends TechPanel {
    scoreScreenState;
    constructor(pos, size, scoreScreenState) {
        super(pos, size);
        this.scoreScreenState = scoreScreenState;
        this.addChildren(new TextButton("Done", () => {
            void gameStateManager.switch(Promise.resolve(new MainMenuState()));
        }, ScreenCoord.rect(.2, .8), ScreenCoord.rect(.6, .1)));
    }
    renderImpl() {
        const { remainingUnits, timeTaken } = this.scoreScreenState;
        super.renderImpl();
        const titleStr = remainingUnits.length > 0 ? "Victory" : "Defeat";
        const remainingHealth = remainingUnits.reduce((a, b) => a += b.health, 0);
        const timeStr = `Time Taken: ${Math.floor(timeTaken / 60)}:${Math.ceil(timeTaken % 60).toString().padStart(2, "0")}`;
        const points = Math.ceil(remainingHealth * 100 / Math.sqrt(timeTaken));
        ctx.save();
        ctx.fillStyle = "#0F0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = ScreenCoord.sq(0, .15).canvasSize[1] + "px tech";
        ctx.fillText(titleStr, ...ScreenCoord.rect(.5, .2).canvasPos);
        ctx.font = ScreenCoord.sq(0, .05).canvasSize[1] + "px tech";
        ctx.fillText("Total Remaining Health: " + remainingHealth, ...ScreenCoord.rect(.5, .35).canvasPos);
        ctx.fillText(timeStr, ...ScreenCoord.rect(.5, .5).canvasPos);
        ctx.fillText("Points: " + points, ...ScreenCoord.rect(.5, .65).canvasPos);
        ctx.restore();
    }
}
//# sourceMappingURL=ScoreScreenPanel.js.map