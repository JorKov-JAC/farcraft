import { rect } from "../engine/vector.js"
import { images } from "../global.js"
import { ctx } from "../context.js"
import assets from "../assets.js"
import Direction from "../engine/Direction.js"
import Serializable from "./Serializable.js"
import SerializableId from "./SerializableId.js"

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

export default class World implements Serializable<World, { mapName: string }> {
	// Needed for serialization:
	mapDefName: string

	tilemap: Tilemap
	collisionGrid: boolean[]

	private constructor(mapDefName: string, tilemap: Tilemap, collisionGrid: boolean[]) {
		this.mapDefName = mapDefName
		this.tilemap = tilemap
		this.collisionGrid = collisionGrid
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

		return new World(mapDefName, tilemap, collisionGrid)
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

		ctx.restore()
	}

	isSolid(x: number, y: number): boolean {
		return !rect(0, 0, this.tilemap.width-1, this.tilemap.height-1).iAabbV2([x, y])
			|| this.collisionGrid[Math.floor(y) * this.tilemap.width + Math.floor(x)]!
	}

	pathfind(a: V2, b: V2): V2[] | null {
		try {
			a[0] = Math.floor(a[0])
			a[1] = Math.floor(a[1])

			b[0] = Math.floor(b[0])
			b[1] = Math.floor(b[1])

			const width = this.tilemap.width

			type Node = {dist: number, traveled: number, from: Node|null, pos: V2, currDirection: Direction}
			const distAtExploredTile: number[] = []

			const startNode: Node = {
				dist: a.taxiDist(b),
				traveled: 0,
				from: null,
				pos: a,
				currDirection: 0 as Direction
			}

			const nodes: Node[] = [startNode]
			distAtExploredTile[a[1] * width + a[0]] = startNode.dist

			let currentNode: Node
			while (true) {
				currentNode = nodes[nodes.length - 1]!
				if (!currentNode) return null
				if (currentNode.pos.equals(b)) break
				if (currentNode.currDirection >= Direction.SIZE) {
					nodes.pop()
					continue
				}

				const newNodePos = currentNode.pos.slice()
				switch (currentNode.currDirection) {
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

			const path: V2[] = []
			while (currentNode) {
				path.push(currentNode.pos)
				currentNode = currentNode.from!
			}
			path.reverse()

			return path
		} catch (e) {
			console.group("Exception while trying to find path!")
			console.dir(e)
			console.groupEnd()
			return null
		}
	} 

	classId(): SerializableId {
		return SerializableId.WORLD
	}
	deserializationForm(serializable: { mapName: string }) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		return World.create(serializable.mapName as any)
	}
	serializationForm() {
		return { mapName: this.mapDefName }
	}
}
