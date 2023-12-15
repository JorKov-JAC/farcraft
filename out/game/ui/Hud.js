import { Panel } from "../../engine/ui/Panel.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import CommandMap from "./hud/CommandMap.js";
import Minimap from "./hud/Minimap.js";
export default class Hud extends Panel {
    constructor(pos, size, camera) {
        super(pos, size);
        camera.pos = ScreenCoord.rect(0, 0);
        camera.size = ScreenCoord.rect(1, .8);
        camera.extraYMult = .05 / .8;
        const children = [
            camera,
            new Minimap(ScreenCoord.rect(0, 1).setSq(0, -.25), ScreenCoord.sq(.25, .25)),
            new CommandMap(ScreenCoord.rect(1, 1).setSq(-.25, -.25), ScreenCoord.sq(.25, .25))
        ];
        this.children.push(...children);
    }
    renderImpl() { }
}
//# sourceMappingURL=Hud.js.map