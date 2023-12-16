import { provide } from "../../engine/Provider.js";
import { Panel } from "../../engine/ui/Panel.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import Game from "../Game.js";
import CommandMap from "./hud/CommandMap.js";
import Minimap from "./hud/Minimap.js";
import WorldPanel from "./hud/WorldPanel.js";
export default class Hud extends Panel {
    game;
    worldPanel;
    constructor(pos, size, game) {
        super(pos, size);
        this.game = game;
        game.camera.extraYMult = .05 / .8;
        this.worldPanel = new WorldPanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, .8), game);
        const children = [
            this.worldPanel,
            new Minimap(ScreenCoord.rect(0, 1).setSq(0, -.25), ScreenCoord.sq(.25, .25)),
            new CommandMap(ScreenCoord.rect(1, 1).setSq(-.25, -.25), ScreenCoord.sq(.25, .25))
        ];
        this.children.push(...children);
    }
    baseUpdate(dt) {
        provide(Game, this.game, () => {
            super.baseUpdate(dt);
        });
    }
    baseRender() {
        provide(Game, this.game, () => {
            super.baseRender();
        });
    }
    renderImpl() { }
}
//# sourceMappingURL=Hud.js.map