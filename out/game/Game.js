import { ctx } from "../context.js";
import { provide } from "../engine/Provider.js";
import { SerializableClock } from "../engine/clock.js";
import { ScreenCoord } from "../engine/ui/ScreenCoord.js";
import { v2 } from "../engine/vector.js";
import { gameStateManager, mousePos } from "../global.js";
import Camera from "./Camera.js";
import World from "./World.js";
import Unit from "./entities/Unit.js";
import ScoreScreenState from "./gameStates/ScoreScreenState.js";
import Hud from "./ui/Hud.js";
export default class Game {
    hud;
    world;
    camera;
    clock = new SerializableClock();
    ongoingDrag = null;
    selectedEnts = new Set();
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
        this.clock.update(dt);
        provide(Game, this, () => {
            this.camera.update(dt);
            this.world.update(dt);
        });
        for (const e of this.selectedEnts.values()) {
            if (e.health <= 0)
                this.selectedEnts.delete(e);
        }
        if (!this.world.ents.find(e => e instanceof Unit && e.owner === 0)
            || !this.world.ents.find(e => e instanceof Unit && e.owner === 1)) {
            const remainingUnits = this.world.ents.filter(e => e instanceof Unit && e.owner === 0);
            const timeTaken = this.clock.getTime();
            void gameStateManager.switch(Promise.resolve(new ScoreScreenState(remainingUnits, timeTaken)));
        }
    }
    render(x, y, w, h) {
        provide(Game, this, () => {
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
        });
    }
    startDrag(pos) {
        this.ongoingDrag = pos;
    }
    stopDrag(endPos) {
        if (!this.ongoingDrag)
            return;
        const selected = this.world
            .unitsWithinBoundsInclusive(...this.ongoingDrag, ...endPos)
            .filter(e => e.owner === 0);
        if (selected.length > 0) {
            this.selectedEnts.clear();
            for (const ent of selected) {
                this.selectedEnts.add(ent);
            }
        }
        this.ongoingDrag = null;
    }
    orderMove(pos) {
        const commandId = Math.random();
        for (const e of this.selectedEnts.values()) {
            if (!(e instanceof Unit))
                continue;
            e.commandMoveTo(pos, this.world, commandId);
        }
    }
    orderAttackMove(pos) {
        const commandId = Math.random();
        for (const e of this.selectedEnts.values()) {
            if (!(e instanceof Unit))
                continue;
            e.commandAttackMoveTo(pos, this.world, commandId);
        }
    }
    isSelected(e) {
        return this.selectedEnts.has(e);
    }
    classId() {
        return 0;
    }
    preSerialization() {
        this.ongoingDrag = null;
        this.selectedEnts = Array.from(this.selectedEnts.values());
    }
    postSerialization() {
        this.selectedEnts = new Set(this.selectedEnts);
    }
    postDeserialize() {
        this.postSerialization();
        this.hud = new Hud(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), this);
    }
}
//# sourceMappingURL=Game.js.map