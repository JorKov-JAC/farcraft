import { ctx, images } from "../global.js";
async function loadTilemap(path) {
    const response = await fetch(path);
    return response.json();
}
export default class World {
    width;
    height;
    tileset;
    collisionGrid;
    constructor(width, height, tileset, collisionGrid) {
        this.width = width;
        this.height = height;
        this.tileset = tileset;
        this.collisionGrid = collisionGrid;
    }
    async create(mapDef) {
        const tileset = images.getAllSprites(mapDef.tileset).map(e => e.bitmap);
        const tilemap = await loadTilemap("assets/" + mapDef.tilemapJsonPath);
        const collisionGrid = [];
        const solidLayers = tilemap.layers.filter(e => e.name.includes("{solid}"));
        for (let i = 0; i < tilemap.width * tilemap.height; ++i) {
            collisionGrid.push(solidLayers.some(layer => layer.data[i] !== 0));
        }
        return new World(tilemap.width, tilemap.height, tileset, collisionGrid);
    }
    render(x, y, w, h, tileX, tileY, tileLength) {
        ctx.save();
        ctx.translate(ctx.restore());
    }
    isSolid(x, y) {
        return this.collisionGrid[y * this.width + x] ?? true;
    }
}
//# sourceMappingURL=World.js.map