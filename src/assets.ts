import { spanArray } from "./engine/util.js"

export interface ImageAssets {
	[Name: string]: ImageAsset
}

export interface ImageAsset {
	path: string
	spritesDefs: SpritesDef[]
	anims: {
		[AnimName: string]: {
			duration?: number
			frames: number[]
		}
	}
}

export interface SpritesDef {
	/** The size of every cell in the grid containing the sprites */
	gridSize: V2
	/** The offset from the upper-left corner of a grid cell to the
	 * sprite's upper-left corner. */
	actualOffset: V2
	/** The dimensions of the actual sprite itself. */
	actualSize: V2

	// A sprite has a "base", a rectangle considered to be the sprite's overall
	// size. Some of its individual sprites may be bigger or smaller, but these
	// are the dimensions used when scaling the sprite to be an appropriate
	// size, for example.
	/** The offset to the sprite's base. */
	baseOffset: V2
	/** The size of the sprite's base. */
	baseSize: V2
	/** Each span is a rectangle of grid cells. */
	spans: Array<{
		/** The upper-left corner of this span's rectangle. */
		start: V2
		/** How many grid cells wide and tall this span's rectangle is. */
		gridRect: V2
		/** How many sprites there are within this span, row-major. */
		count?: number
	}>
}

export default {
	images: {
		// bigInfantry: {
		// 	path: "sprites/bigInfantry.png"
		// },
		marine: {
			path: "sprites/infantry.png",
			spritesDefs: [
				{
					gridSize: [32, 32],
					actualOffset: [0, 13],
					actualSize: [32, 32 - 13],
					baseOffset: [10, 18],
					baseSize: [10, 14],
					spans: [
						{
							start: [0, 2 * 32],
							gridRect: [4, 1]
						},
						{
							start: [32, 4 * 32],
							gridRect: [1, 1]
						},
						{
							start: [0, 14 * 32],
							gridRect: [4, 1]
						},
						{
							start: [0, 800],
							gridRect: [4, 1]
						}
					]
				}
			],
			anims: {
				"spawn": {
					frames: spanArray(0, 4)
				},
				"idle": {
					duration: 1,
					frames: [4]
				},
				"move": {
					duration: 1,
					frames: spanArray(5, 4)
				},
				"shoot": {
					duration: 1,
					frames: spanArray(9, 4)
				},
				"die": {
					duration: 1,
					frames: spanArray(3, -4)
				},
			}
		},
		// techTiles: {
		// 	path: "sprites/techTiles.png"
		// },
		// worker: {
		// 	path: "sprites/worker.png"
		// },
		// workerOutlined: {
		// 	path: "sprites/workerOutlined.png"
		// },
	} satisfies ImageAssets,
	sounds: {
		death: "sounds/death.mp3",
		music_aStepCloser: "music/aStepCloser.mp3",
		music_darkfluxxTheme: "music/darkfluxxTheme.mp3",
	}
}
