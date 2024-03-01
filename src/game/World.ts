import { rect } from "../engine/vector.js"
import { gameSounds, images } from "../global.js"
import { ctx } from "../context.js"
import assets, { AnyAnimName, ImageGroupName } from "../assets.js"
import Direction from "../engine/Direction.js"
import Serializable, { CustomDForm, CustomDFormOf, DForm } from "./Serializable.js"
import SerializableId from "./SerializableId.js"
import Entity from "./Entity.js"
import Unit from "./entities/Unit.js"
import Corpse from "./entities/Corpse.js"

/** The raw data which defines a tilemap. */
interface TilemapData {
	width: number
	height: number
	layers: Array<{
		data: number[]
		name: string
	}>
}

/**
 * Loads the raw data for a tilemap.
 * 
 * @param path The filepath of the tilemap data.
 * @return Resolves to the raw tilemap data.
 */
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

/**
 * The world in which game objects exist.
*/
export default class World implements Serializable<World, { mapName: string, ents: Entity<any>[] }> {
	// Since we don't want to reserialize the map when saving, we need to
	// serialize it by name instead:
	mapDefName: string

	tilemap: Tilemap
	collisionGrid: boolean[]
	ents: Entity<any>[]

	private constructor(mapDefName: string, tilemap: Tilemap, collisionGrid: boolean[], ents: Entity<any>[]) {
		this.mapDefName = mapDefName
		this.tilemap = tilemap
		this.collisionGrid = collisionGrid
		this.ents = ents
	}

	/**
	 * Async constructor.
	 * 
	 * @param mapDefName The name of the map to load.
	 */
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
		// Update entities
		for (const ent of this.ents) {
			ent.baseUpdate(dt)
		}

		// HACK Handle creation of corpses; this should be handled by the
		// entities instead.
		const newCorpses: Corpse<any>[] = []
		this.ents = this.ents.filter(e => {
			if (e instanceof Unit) {
				if (e.health > 0) return true
				void gameSounds.playSound(e.getDeathSound())
				const animGroupName = e.anim.groupName as ImageGroupName
				const anims = assets.images[animGroupName].anims
				if ("die" satisfies AnyAnimName in anims) {
					newCorpses.push(new Corpse(e))
				}
				return false
			}

			return true
		})

		this.ents.push(...newCorpses)

		// Cleanup entities
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

		// Smallest viewport dimension:
		const vMin = Math.min(w, h)
		// How long a tile should be in viewport pixels:
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

		// Draw entities sorted by Y position
		// TODO Only draw entities within the render bounds.
		const entsByY = this.ents.slice()
		entsByY.sort((a, b) => a.pos[1] - b.pos[1])
		for (const e of entsByY) {
			e.baseRender()
		}

		ctx.restore()
	}

	/**
	 * Checkcs if the given factional tile coordinate is solid.
	 */
	isSolid(x: number, y: number): boolean {
		x = Math.floor(x)
		y = Math.floor(y)
		return !rect(0, 0, this.tilemap.width-1, this.tilemap.height-1).iAabbV2([x, y])
			|| this.collisionGrid[y * this.tilemap.width + x]!
	}

	/**
	 * Finds a path leading from points {@link b} to {@link a}.
	 * 
	 * @param a The starting coordinate in fractional tiles.
	 * @param b The desired destination coordinate in fractional tiles.
	 * @returns A path leading from {@link b} to {@link a}, or null if one isn't
	 * found.
	 */
	pathfindBackward(a: V2, b: V2): MutV2[] | null {
		// Implementation of A* pathfinding

		try {
			a = a.slice().floor()
			b = b.slice().floor()

			const width = this.tilemap.width

			/** Pathfinding node. */
			type Node = {
				/** How far this node is from the destination. */
				dist: number,
				/** How far this node has travelled from the start. */
				traveled: number,
				/** The previous node which lead to this one. */
				from: Node|null,
				/** The node's frational tile position. */
				pos: MutV2,
				/** The current direction being explored from this node. */
				currDirection: Direction
			}
			/**
			 * A sparse 2D array (stored as 1D) containing the {@link Node.dist}
			 * for every explored tile.
			 */
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
				// Check if we've popped every possible node:
				if (!currentNode) return null
				// Check if we've reached the destination:
				if (currentNode.pos.equals(b)) break
				// Check if we've explored every direction from this node:
				if (currentNode.currDirection >= Direction.SIZE) {
					nodes.pop()
					continue
				}

				const newNodePos = currentNode.pos.slice()
				// Zig-zag the direction we search so that paths go diagonally:
				const zigzagDirection = currentNode.traveled % 2
					? (Direction.SIZE - 1 - currentNode.currDirection) as Direction
					: currentNode.currDirection
				// Explore this node's next direction
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

				// Check if the new position would be solid:
				if (this.isSolid(...newNodePos.lock())) continue

				// Create the next node:
				const traveled = currentNode.traveled + 1
				const newNode: Node = {
					dist: newNodePos.taxiDist(b) + traveled,
					traveled,
					from: currentNode,
					pos: newNodePos,
					currDirection: 0 as Direction
				}

				// Update the tile distances
				const newNodeCoord1D = newNodePos[1] * width + newNodePos[0]
				const existingDist = distAtExploredTile[newNodeCoord1D]
				// Check if this tile has already been explored more efficiently
				// TODO I'm pretty sure that existing distance will always be
				//      more efficent, we don't actually need to store the
				//      explored tile's distance.
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

			// Walk the nodes backward and create a path
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
	 * Checks if a ray between two fractional tile coordinates is blocked by a
	 * solid tile.
	 * 
	 * @returns True if the ray was blocked, false otherwise.
	 */
	isRayObstructed(a: V2, b: V2): boolean {
		if (this.isSolid(...a) || this.isSolid(...b)) return true

		const tile = a.slice().floor()
		const goalTile = b.slice().floor().lock()
		const pos = a.slice()
		const norm = b.slice().sub(a).normOr(1, 1).lock()

		// Check every tile along the way
		while (!tile.equals(goalTile)) {
			const distToNextX = norm[0] === 0 ? Number.MAX_SAFE_INTEGER : Math.max(0, (norm[0] >= 0 ? 1 - (pos[0] - tile[0]) : -(pos[0] - tile[0])) / norm[0])
			const distToNextY = norm[1] === 0 ? Number.MAX_SAFE_INTEGER : Math.max(0, (norm[1] >= 0 ? 1 - (pos[1] - tile[1]) : -(pos[1] - tile[1])) / norm[1])

			// To follow the ray, move into either the horizontal or vertical
			// neighbour depending on which one is closer
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

	/** Gets all units within the provided inclusive coordinate bounds. */
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

	// Serializiation
	classId(): SerializableId {
		return SerializableId.WORLD
	}
	serializationForm() {
		return {
			mapName: this.mapDefName,
			ents: this.ents
		}
	}
	async customDForm(this: never, dForm: DForm<{ mapName: string; ents: Entity<any>[] }>): Promise<CustomDForm<{ mapName: string; ents: Entity[] }>> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const world = await World.create(dForm.mapName as any) as unknown as CustomDFormOf<World>
		world.ents = dForm.ents
		return world
	}
}
