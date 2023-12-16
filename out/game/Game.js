import { ctx } from "../context.js";
import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
import { v2 } from "../engine/vector.js";
import { mousePos } from "../global.js";
import Camera from "./Camera.js";
import World from "./World.js";
import Hud from "./ui/Hud.js";
export default class Game {
    hud;
    world;
    camera;
    ongoingDrag = null;
    selectedEnts = [];
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
        ctx.save();
        if (this.ongoingDrag) {
            const canvasDragStart = this.camera.worldPosToCanvas(this.ongoingDrag).lock();
            ctx.fillStyle = "#0F02";
            ctx.strokeStyle = "#0F0B";
            ctx.beginPath();
            ctx.rect(...canvasDragStart, ...mousePos.slice().sub(canvasDragStart).lock());
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }
    startDrag(pos) {
        this.ongoingDrag = this.camera.canvasPosToWorld(pos);
    }
    stopDrag(pos) {
        if (!this.ongoingDrag)
            return;
        const endPos = this.camera.canvasPosToWorld(pos).lock();
        this.selectedEnts = this.world
            .unitsWithinInclusive(...this.ongoingDrag, ...endPos)
            .filter(e => e.owner === 0);
        this.ongoingDrag = null;
    }
    classId() {
        return 0;
    }
    preSerialization() {
        this.ongoingDrag = null;
    }
    postDeserialize() {
        this.hud = new Hud(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), this);
    }
}
//# sourceMappingURL=Game.js.map