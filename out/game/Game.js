import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
import { v2 } from "../engine/vector.js";
import Camera from "./Camera.js";
import World from "./World.js";
import Hud from "./ui/Hud.js";
export default class Game {
    hud;
    world;
    camera;
    constructor(world) {
        this.camera = new Camera(this, v2(0, 0), 10);
        this.world = world;
        this.hud = null;
        this.postDeserialize();
    }
    static async create(mapName) {
        const world = await World.create(mapName);
        return new Game(world);
    }
    update(dt) {
        this.camera.update(dt);
    }
    render(x, y, w, h) {
        this.world.render(x, y, w, h, ...this.camera.worldPos, this.camera.minLen);
    }
    startDrag(pos) {
    }
    stopDrag(pos) {
    }
    classId() {
        return 0;
    }
    postDeserialize() {
        this.hud = new Hud(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), this);
    }
}
//# sourceMappingURL=Game.js.map