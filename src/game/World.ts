import { MapDef } from "../assets.js"
import { ctx, images } from "../global.js"

interface Tilemap {
	width: number
	height: number
	layers: Array<{
		data: number[]
		name: string
	}>
}

async function loadTilemap(path: string): Promise<Tilemap> {
	const response = await fetch(path)
	return response.json() as unknown as Tilemap
}

export default class World {
	width: number
	height: number
	tileset: ImageBitmap[]
	collisionGrid: boolean[]

	private constructor(width: number, height: number, tileset: ImageBitmap[], collisionGrid: boolean[]) {
		this.width = width
		this.height = height
		this.tileset = tileset
		this.collisionGrid = collisionGrid
	}

	async create(mapDef: MapDef): Promise<World> {
		const tileset = images.getAllSprites(mapDef.tileset).map(e => e.bitmap)
		const tilemap = await loadTilemap("assets/" + mapDef.tilemapJsonPath)

		const collisionGrid = []
		const solidLayers = tilemap.layers.filter(e => e.name.includes("{solid}"))
		for (let i = 0; i < tilemap.width * tilemap.height; ++i) {
			collisionGrid.push(solidLayers.some(layer => layer.data[i]! !== 0))
		}

		return new World(tilemap.width, tilemap.height, tileset, collisionGrid)
	}

	render(x: number, y: number, w: number, h: number, tileX: number, tileY: number, tileLength: number) {
		ctx.save()

		ctx.translate(

		ctx.restore()
	}

	isSolid(x: number, y: number) {
		return this.collisionGrid[y * this.width + x] ?? true
	}
}
