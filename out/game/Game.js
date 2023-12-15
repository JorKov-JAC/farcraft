import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
import { v2 } from "../engine/vector.js";
import { keys } from "../global.js";
import Camera from "./Camera.js";
import World from "./World.js";
import Hud from "./ui/Hud.js";
export default class Game {
    panel;
    world;
    camera;
    constructor(world) {
        this.camera = new Camera(ScreenCoord.rect(0, 0), ScreenCoord.rect(0, 0), this, v2(0, 0), 10);
        this.panel = new Hud(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), this.camera);
        this.world = world;
    }
    static async create(mapName) {
        const world = await World.create(mapName);
        return new Game(world);
    }
    update(dt) {
        const moveVec = v2(0, 0).mut();
        if (keys["ArrowRight"])
            moveVec[0] += 1;
        if (keys["ArrowLeft"])
            moveVec[0] -= 1;
        if (keys["ArrowUp"])
            moveVec[1] -= 1;
        if (keys["ArrowDown"])
            moveVec[1] += 1;
        this.camera.moveBy(moveVec, dt);
    }
    startDrag(pos) {
    }
    stopDrag(pos) {
    }
}
//# sourceMappingURL=Game.js.map