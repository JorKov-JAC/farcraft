import { rect } from "../engine/vector.js"
import { images } from "../global.js"
import { ctx } from "../context.js"
import assets from "../assets.js"

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

export default class World {
	tilemap: Tilemap

	collisionGrid: boolean[]

	private constructor(tilemap: Tilemap, collisionGrid: boolean[]) {
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

		return new World(tilemap, collisionGrid)
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
		// return this.collisionGrid[y * this.width + x] ?? true
	}
}
