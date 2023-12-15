import { rect } from "../engine/vector.js";
import { images } from "../global.js";
import { ctx } from "../context.js";
import assets from "../assets.js";
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
    mapDefName;
    tilemap;
    collisionGrid;
    constructor(mapDefName, tilemap, collisionGrid) {
        this.mapDefName = mapDefName;
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
        return new World(mapDefName, tilemap, collisionGrid);
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
        const tileBoundsRect = rect(0, 0, this.tilemap.width - 1, this.tilemap.height - 1);
        for (const layer of this.tilemap.tilemapLayers) {
            for (let screenY = startY - startTileYRem * tileLen, tileY = startTileYFloor; screenY < startY + h; screenY += tileLen, ++tileY) {
                for (let screenX = startX - startTileXRem * tileLen, tileX = startTileXFloor; screenX < startX + w; screenX += tileLen, ++tileX) {
                    if (!tileBoundsRect.iAabbV2([tileX, tileY])) {
                        ctx.fillStyle = "#000";
                        ctx.fillRect(screenX, screenY, tileLen, tileLen);
                        continue;
                    }
                    const bitmapId = layer[tileY * this.tilemap.width + tileX];
                    if (bitmapId === 0)
                        continue;
                    const bitmap = this.tilemap.tileset[bitmapId - 1];
                    ctx.drawImage(bitmap, screenX, screenY, tileLen + 1, tileLen + 1);
                    ctx.drawImage(bitmap, screenX, screenY, tileLen, tileLen);
                }
            }
        }
        ctx.restore();
    }
    isSolid(x, y) {
        return !rect(0, 0, this.tilemap.width - 1, this.tilemap.height - 1).iAabbV2([x, y])
            || this.collisionGrid[Math.floor(y) * this.tilemap.width + Math.floor(x)];
    }
    pathfind(a, b) {
        try {
            a[0] = Math.floor(a[0]);
            a[1] = Math.floor(a[1]);
            b[0] = Math.floor(b[0]);
            b[1] = Math.floor(b[1]);
            const width = this.tilemap.width;
            const distAtExploredTile = [];
            const startNode = {
                dist: a.taxiDist(b),
                traveled: 0,
                from: null,
                pos: a,
                currDirection: 0
            };
            const nodes = [startNode];
            distAtExploredTile[a[1] * width + a[0]] = startNode.dist;
            let currentNode;
            while (true) {
                currentNode = nodes[nodes.length - 1];
                if (!currentNode)
                    return null;
                if (currentNode.pos.equals(b))
                    break;
                if (currentNode.currDirection >= 4) {
                    nodes.pop();
                    continue;
                }
                const newNodePos = currentNode.pos.slice();
                switch (currentNode.currDirection) {
                    case 0:
                        newNodePos.add2(1, 0);
                        break;
                    case 1:
                        newNodePos.add2(0, -1);
                        break;
                    case 2:
                        newNodePos.add2(-1, 0);
                        break;
                    case 3:
                        newNodePos.add2(0, 1);
                        break;
                    case 4:
                        throw Error("Tried to go past all possible directions");
                }
                ++currentNode.currDirection;
                if (this.isSolid(...newNodePos.lock()))
                    continue;
                const traveled = currentNode.traveled + 1;
                const newNode = {
                    dist: newNodePos.taxiDist(b) + traveled,
                    traveled,
                    from: currentNode,
                    pos: newNodePos,
                    currDirection: 0
                };
                const newNodeCoord1D = newNodePos[1] * width + newNodePos[0];
                const existingDist = distAtExploredTile[newNodeCoord1D];
                if (existingDist !== undefined && existingDist <= newNode.dist) {
                    continue;
                }
                distAtExploredTile[newNodeCoord1D] = newNode.dist;
                let insertion = 0;
                for (let i = nodes.length; i-- > 0;) {
                    if (nodes[i].dist >= newNode.dist) {
                        insertion = i + 1;
                        break;
                    }
                }
                nodes.splice(insertion, 0, newNode);
            }
            const path = [];
            while (currentNode) {
                path.push(currentNode.pos);
                currentNode = currentNode.from;
            }
            path.reverse();
            return path;
        }
        catch (e) {
            console.group("Exception while trying to find path!");
            console.dir(e);
            console.groupEnd();
            return null;
        }
    }
    classId() {
        return 1;
    }
    deserialize(serializable) {
        return World.create(serializable.mapName);
    }
    prepareForSerialization() {
        return { mapName: this.mapDefName };
    }
}
//# sourceMappingURL=World.js.map