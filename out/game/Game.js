export default class Game {
    panel;
    world;
    constructor(panel, world) {
        this.panel = panel;
        this.world = world;
    }
    static async create(mapName) {
        return new Game(panel, world);
    }
    update(dt) {
    }
}
//# sourceMappingURL=Game.js.map