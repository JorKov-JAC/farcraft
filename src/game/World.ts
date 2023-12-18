import { rect } from "../engine/vector.js"
import { gameSounds, images } from "../global.js"
import { ctx } from "../context.js"
import assets, { ImageGroupName } from "../assets.js"
import Direction from "../engine/Direction.js"
import Serializable, { CustomDForm, CustomDFormOf, DForm } from "./Serializable.js"
import SerializableId from "./SerializableId.js"
import Entity from "./Entity.js"
import ArmyEntity from "./entities/ArmyEntity.js"
import Unit from "./entities/Unit.js"
import Corpse from "./entities/Corpse.js"

interface TilemapData {
	width: number
	height: number
	layers: Array<{
		data: number[]
		name: string
	}>
}

async function loadTilemapData(path: string): Promise<TilemapData> {
	const response = await fetch(path)
	return response.json() as unknown as TilemapData
}

class Tilemap {
	width: number
	height: number
	tilemapLayers: number[][]
	tileset: ImageBitmap[]

	constructor(width: number, height: number, tilemap: number[][], tileset: ImageBitmap[]) {
		this.width = width
		this.height = height
		this.tilemapLayers = tilemap
		this.tileset = tileset
	}
}

export default class World implements Serializable<World, { mapName: string, ents: Entity[] }> {
	// Needed for serialization:
	mapDefName: string

	tilemap: Tilemap
	collisionGrid: boolean[]
	ents: Entity[]

	private constructor(mapDefName: string, tilemap: Tilemap, collisionGrid: boolean[], ents: Entity[]) {
		this.mapDefName = mapDefName
		this.tilemap = tilemap
		this.collisionGrid = collisionGrid
		this.ents = ents
	}

	static async create(mapDefName: keyof (typeof assets)["maps"]): Promise<World> {
		const mapDef = assets.maps[mapDefName]
		const tileset = images.getAllSprites(mapDef.tileset).map(e => e.bitmap)
		const tilemapData = await loadTilemapData("assets/" + mapDef.tilemapJsonPath)

		const tilemap = new Tilemap(
			tilemapData.width,
			tilemapData.height,
			tilemapData.layers.map(e => e.data),
			tileset
		)

		const collisionGrid = []
		const solidLayers = tilemapData.layers.filter(e => e.name.includes("{solid}"))
		for (let i = 0; i < tilemap.width * tilemap.height; ++i) {
			collisionGrid.push(solidLayers.some(layer => layer.data[i]! !== 0))
		}

		return new World(mapDefName, tilemap, collisionGrid, [])
	}

	update(dt: number) {
		for (const ent of this.ents) {
			ent.baseUpdate(dt)
		}

		const newCorpses: Corpse<any>[] = []
		this.ents = this.ents.filter(e => {
			if (e instanceof Unit) {
				if (e.health > 0) return true
				void gameSounds.playSound(e.getDeathSound())
				const animGroupName = e.anim.groupName as ImageGroupName
				const anims = assets.images[animGroupName].anims
				if ("death" in anims) {
					// newCorpses.push(new Corpse(e.pos, e.getRadius(), new Anim(animGroupName, "death")))
				}
				return false
			}

			return true
		})

		this.ents.push(...newCorpses)

		this.ents = this.ents.filter(e => !e.shouldCleanUp())
	}

	/**
	 * @param tiles Scale of 1 would be 1 tile for every min(w, h), 2 would be
	 * 2 tiles and so on.
	 */
	render(startX: number, startY: number, w: number, h: number, startTileX: number, startTileY: number, tiles: number) {
		ctx.save()

		// Constrain to the given bounds
		ctx.beginPath()
		ctx.rect(startX, startY, w, h)
		ctx.clip()

		const vMin = Math.min(w, h)
		const tileLen = vMin / tiles

		const startTileXFloor = Math.floor(startTileX)
		const startTileXRem = startTileX - startTileXFloor
		const startTileYFloor = Math.floor(startTileY)
		const startTileYRem = startTileY - startTileYFloor

		const tileBoundsRect = rect(0, 0, this.tilemap.width - 1, this.tilemap.height - 1)

		for (const layer of this.tilemap.tilemapLayers) {
			for (
				let screenY = startY - startTileYRem * tileLen, tileY = startTileYFloor;
				screenY < startY + h;
				screenY += tileLen, ++tileY
			) {
				for (
					let screenX = startX - startTileXRem * tileLen, tileX = startTileXFloor;
					screenX < startX + w;
					screenX += tileLen, ++tileX
				) {
					// Black if out of bounds
					if (!tileBoundsRect.iAabbV2([tileX, tileY])) {
						ctx.fillStyle = "#000"
						ctx.fillRect(screenX, screenY, tileLen, tileLen)
						continue
					}

					const bitmapId = layer[tileY * this.tilemap.width + tileX]!
					// Do nothing if it's a transparent tile
					if (bitmapId === 0) continue

					const bitmap = this.tilemap.tileset[bitmapId - 1]!
					// render twice to avoid seems
					ctx.drawImage(bitmap, screenX, screenY, tileLen + 1, tileLen + 1)
					ctx.drawImage(bitmap, screenX, screenY, tileLen, tileLen)
				}
			}
		}

		const armyEnts = this.ents.filter(e => e instanceof ArmyEntity) as ArmyEntity<any>[]
		armyEnts.sort((a, b) => a.pos[1] - b.pos[1])
		for (const armyEnt of armyEnts) {
			armyEnt.baseRender()
		}

		ctx.restore()
	}

	isSolid(x: number, y: number): boolean {
		x = Math.floor(x)
		y = Math.floor(y)
		return !rect(0, 0, this.tilemap.width-1, this.tilemap.height-1).iAabbV2([x, y])
			|| this.collisionGrid[y * this.tilemap.width + x]!
	}

	pathfindBackward(a: V2, b: V2): MutV2[] | null {
		try {
			a = a.slice().floor()
			b = b.slice().floor()

			const width = this.tilemap.width

			type Node = {dist: number, traveled: number, from: Node|null, pos: MutV2, currDirection: Direction}
			const distAtExploredTile: number[] = []

			const startNode: Node = {
				dist: a.taxiDist(b),
				traveled: 0,
				from: null,
				pos: a.slice(),
				currDirection: 0 as Direction
			}

			const nodes: Node[] = [startNode]
			distAtExploredTile[a[1] * width + a[0]] = startNode.dist

			let currentNode: Node | undefined | null
			while (true) {
				currentNode = nodes[nodes.length - 1]
				if (!currentNode) return null
				if (currentNode.pos.equals(b)) break
				if (currentNode.currDirection >= Direction.SIZE) {
					nodes.pop()
					continue
				}

				const newNodePos = currentNode.pos.slice()
				const zigzagDirection = currentNode.traveled % 2
					? (Direction.SIZE - 1 - currentNode.currDirection) as Direction
					: currentNode.currDirection
				switch (zigzagDirection) {
					case Direction.RIGHT:
						newNodePos.add2(1, 0)
						break;
					case Direction.UP:
						newNodePos.add2(0, -1)
						break;
					case Direction.LEFT:
						newNodePos.add2(-1, 0)
						break;
					case Direction.DOWN:
						newNodePos.add2(0, 1)
						break;
					case Direction.SIZE:
						throw Error("Tried to go past all possible directions")
				}
				++currentNode.currDirection

				if (this.isSolid(...newNodePos.lock())) continue

				const traveled = currentNode.traveled + 1
				const newNode: Node = {
					dist: newNodePos.taxiDist(b) + traveled,
					traveled,
					from: currentNode,
					pos: newNodePos,
					currDirection: 0 as Direction
				}

				const newNodeCoord1D = newNodePos[1] * width + newNodePos[0]
				const existingDist = distAtExploredTile[newNodeCoord1D]
				if (existingDist !== undefined && existingDist <= newNode.dist) {
					continue
				}
				distAtExploredTile[newNodeCoord1D] = newNode.dist

				// Insert the new node in its sorted place
				let insertion = 0
				for (let i = nodes.length; i --> 0; ) {
					if (nodes[i]!.dist >= newNode.dist) {
						insertion = i+1
						break
					}
				}
				nodes.splice(insertion, 0, newNode)
			}

			const path: MutV2[] = []
			while (currentNode) {
				path.push(currentNode.pos)
				currentNode = currentNode.from
			}

			return path
		} catch (e) {
			console.group("Exception while trying to find path!")
			console.dir(e)
			console.groupEnd()
			return null
		}
	} 

	/**
	 * @returns True if the ray was blocked, false otherwise.
	 */
	isRayObstructed(a: V2, b: V2): boolean {
		if (this.isSolid(...a) || this.isSolid(...b)) return true

		const tile = a.slice().floor()
		const goalTile = b.slice().floor().lock()
		const pos = a.slice()
		const norm = b.slice().sub(a).normOr(1, 1).lock()

		while (!tile.equals(goalTile)) {
			const distToNextX = norm[0] === 0 ? Number.MAX_SAFE_INTEGER : Math.max(0, (norm[0] >= 0 ? 1 - (pos[0] - tile[0]) : -(pos[0] - tile[0])) / norm[0])
			const distToNextY = norm[1] === 0 ? Number.MAX_SAFE_INTEGER : Math.max(0, (norm[1] >= 0 ? 1 - (pos[1] - tile[1]) : -(pos[1] - tile[1])) / norm[1])

			if (distToNextX < distToNextY && norm[0] !== 0 || norm[1] === 0) {
				tile[0] += norm[0] > 0 ? 1 : -1
				pos.add(norm.slice().mul(distToNextX))
			} else {
				tile[1] += norm[1] > 0 ? 1 : -1
				pos.add(norm.slice().mul(distToNextY))
			}

			if (this.isSolid(...tile.lock())) return true
		}

		return false
	}

	unitsWithinBoundsInclusive(x0: number, y0: number, x1: number, y1: number): Unit<any>[] {
		if (x0 > x1) [x0, x1] = [x1, x0]
		if (y0 > y1) [y0, y1] = [y1, y0]
		const bounds = rect(x0, y0, x1 - x0, y1 - y0)

		return this.ents.filter(e => {
			if (!(e instanceof Unit)) return false
			const r = e.getRadius()
			return bounds.iAabb4(e.pos[0] - r, e.pos[1] - r, r * 2, r * 2)
		}) as Unit<any>[]
	}

	classId(): SerializableId {
		return SerializableId.WORLD
	}
	serializationForm() {
		return {
			mapName: this.mapDefName,
			ents: this.ents
		}
	}
	async customDForm(this: never, dForm: DForm<{ mapName: string; ents: Entity[] }>): Promise<CustomDForm<{ mapName: string; ents: Entity[] }>> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const world = await World.create(dForm.mapName as any) as unknown as CustomDFormOf<World>
		world.ents = dForm.ents
		return world
	}
}
