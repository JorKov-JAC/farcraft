import { rect } from "../engine/vector.js";
import { gameSounds, images } from "../global.js";
import { ctx } from "../context.js";
import assets from "../assets.js";
import ArmyEntity from "./entities/ArmyEntity.js";
import Unit from "./entities/Unit.js";
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
    ents;
    constructor(mapDefName, tilemap, collisionGrid, ents) {
        this.mapDefName = mapDefName;
        this.tilemap = tilemap;
        this.collisionGrid = collisionGrid;
        this.ents = ents;
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
        return new World(mapDefName, tilemap, collisionGrid, []);
    }
    update(dt) {
        for (const ent of this.ents) {
            ent.baseUpdate(dt);
        }
        let entDied = false;
        const newCorpses = [];
        this.ents = this.ents.filter(e => {
            if (e instanceof Unit) {
                if (e.health > 0)
                    return true;
                entDied = true;
                const animGroupName = e.anim.groupName;
                const anims = assets.images[animGroupName].anims;
                if ("death" in anims) {
                }
                return false;
            }
            return true;
        });
        this.ents.push(...newCorpses);
        if (entDied) {
            void gameSounds.playSound("death");
        }
        this.ents = this.ents.filter(e => !e.shouldCleanUp());
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
        const armyEnts = this.ents.filter(e => e instanceof ArmyEntity);
        armyEnts.sort((a, b) => a.pos[1] - b.pos[1]);
        for (const armyEnt of armyEnts) {
            armyEnt.baseRender();
        }
        ctx.restore();
    }
    isSolid(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        return !rect(0, 0, this.tilemap.width - 1, this.tilemap.height - 1).iAabbV2([x, y])
            || this.collisionGrid[y * this.tilemap.width + x];
    }
    pathfindBackward(a, b) {
        try {
            a = a.slice().floor();
            b = b.slice().floor();
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
                const zigzagDirection = (currentNode.currDirection
                    + currentNode.traveled % 2) % 4;
                switch (zigzagDirection) {
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
            return path;
        }
        catch (e) {
            console.group("Exception while trying to find path!");
            console.dir(e);
            console.groupEnd();
            return null;
        }
    }
    isRayObstructed(a, b) {
        if (this.isSolid(...a) || this.isSolid(...b))
            return true;
        const tile = a.slice().floor();
        const goalTile = b.slice().floor().lock();
        const pos = a.slice();
        const norm = b.slice().sub(a).normOr(1, 1).lock();
        while (!tile.equals(goalTile)) {
            const distToNextX = norm[0] === 0 ? Number.MAX_SAFE_INTEGER : Math.max(0, (norm[0] >= 0 ? 1 - (pos[0] - tile[0]) : -(pos[0] - tile[0])) / norm[0]);
            const distToNextY = norm[1] === 0 ? Number.MAX_SAFE_INTEGER : Math.max(0, (norm[1] >= 0 ? 1 - (pos[1] - tile[1]) : -(pos[1] - tile[1])) / norm[1]);
            if (distToNextX < distToNextY && norm[0] !== 0 || norm[1] === 0) {
                tile[0] += norm[0] > 0 ? 1 : -1;
                pos.add(norm.slice().mul(distToNextX));
            }
            else {
                tile[1] += norm[1] > 0 ? 1 : -1;
                pos.add(norm.slice().mul(distToNextY));
            }
            if (this.isSolid(...tile.lock()))
                return true;
        }
        return false;
    }
    unitsWithinBoundsInclusive(x0, y0, x1, y1) {
        if (x0 > x1)
            [x0, x1] = [x1, x0];
        if (y0 > y1)
            [y0, y1] = [y1, y0];
        const bounds = rect(x0, y0, x1 - x0, y1 - y0);
        return this.ents.filter(e => {
            if (!(e instanceof Unit))
                return false;
            const r = e.getRadius();
            return bounds.iAabb4(e.pos[0] - r, e.pos[1] - r, r * 2, r * 2);
        });
    }
    classId() {
        return 1;
    }
    serializationForm() {
        return {
            mapName: this.mapDefName,
            ents: this.ents
        };
    }
    async deserializationForm(serializable) {
        const world = await World.create(serializable.mapName);
        world.ents = serializable.ents;
        return world;
    }
}
//# sourceMappingURL=World.js.map