import assets from "../assets.js";
import { rect } from "../engine/vector.js";
import { ctx, images } from "../global.js";
async function loadTilemapData(path) {
    const response = await fetch(path);
    return response.json();
}
class Tilemap {
    width;
    height;
    tilemapLayers;
    tileset;
    constructor(width, height, tilemap, tileset) {
        this.width = width;
        this.height = height;
        this.tilemapLayers = tilemap;
        this.tileset = tileset;
    }
}
export default class World {
    tilemap;
    collisionGrid;
    constructor(tilemap, collisionGrid) {
        this.tilemap = tilemap;
        this.collisionGrid = collisionGrid;
    }
    static async create(mapDefName) {
        const mapDef = assets.maps[mapDefName];
        const tileset = images.getAllSprites(mapDef.tileset).map(e => e.bitmap);
        const tilemapData = await loadTilemapData("assets/" + mapDef.tilemapJsonPath);
        const tilemap = new Tilemap(tilemapData.width, tilemapData.height, tilemapData.layers.map(e => e.data), tileset);
        const collisionGrid = [];
        const solidLayers = tilemapData.layers.filter(e => e.name.includes("{solid}"));
        for (let i = 0; i < tilemap.width * tilemap.height; ++i) {
            collisionGrid.push(solidLayers.some(layer => layer.data[i] !== 0));
        }
        return new World(tilemap, collisionGrid);
    }
    render(startX, startY, w, h, startTileX, startTileY, tiles) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(startX, startY, w, h);
        ctx.clip();
        const vMin = Math.min(w, h);
        const tileLen = vMin / tiles;
        const startTileXFloor = Math.floor(startTileX);
        const startTileXRem = startTileX - startTileXFloor;
        const startTileYFloor = Math.floor(startTileY);
        const startTileYRem = startTileY - startTileYFloor;
        const tileBoundsRect = rect(0, 0, this.tilemap.width, this.tilemap.height);
        for (const layer of this.tilemap.tilemapLayers) {
            for (let screenY = startY - startTileYRem * tileLen, tileY = startTileYFloor; screenY < startY + h; screenY += tileLen, ++tileY) {
                for (let screenX = startX - startTileXRem * tileLen, tileX = startTileXFloor; screenX < startX + w; screenX += tileLen, ++tileX) {
                    if (!tileBoundsRect.aabbV2([tileX, tileY])) {
                        ctx.fillStyle = "#000";
                        ctx.fillRect(screenX, screenY, tileLen, tileLen);
                        continue;
                    }
                    const bitmapId = layer[tileY * this.tilemap.width + tileX];
                    if (bitmapId === 0)
                        continue;
                    const bitmap = this.tilemap.tileset[bitmapId - 1];
                    ctx.drawImage(bitmap, screenX, screenY, tileLen, tileLen);
                }
            }
        }
        ctx.restore();
    }
    isSolid(x, y) {
    }
}
//# sourceMappingURL=World.js.map