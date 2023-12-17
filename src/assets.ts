import { repeat, spanArray } from "./engine/util.js"
import SerializableId from "./game/SerializableId.js"
import { Owner } from "./game/entities/ArmyEntity.js"
import Marine from "./game/entities/Marine.js"
import Sarge from "./game/entities/Sarge.js"
import Unit from "./game/entities/Unit.js"

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

export interface MapDef {
	tilemapJsonPath: string
	tileset: keyof typeof images
}

export interface UnitInfo<T extends abstract new (a: any) => Unit<any>> {
	typeId: SerializableId
	instanceArgs: Omit<ConstructorParameters<T>[0], "owner">[]
	// args: {
	// 	[K in keyof ConstructorParameters<T>]: ConstructorParameters<T>[K]
	// }
}

export interface LevelDef {
	mapName: keyof typeof maps
	cameraUpperLeft: V2
	units: {
		owner: Owner
		units: UnitInfo<any>[]
	}[]
}

const images = {
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
						start: [32, 7 * 32],
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
				duration: 2,
				frames: spanArray(5, 4)
			},
			"shoot": {
				frames: [...repeat(spanArray(9, 4), 2).flat(), ...repeat(12, 12)]
			},
			"die": {
				duration: 1,
				frames: spanArray(3, -4)
			},
		}
	},
	sarge: {
		path: "sprites/bigInfantry.png",
		spritesDefs: [
			{
				gridSize: [32, 32],
				actualOffset: [0, 0],
				actualSize: [32, 32],
				baseOffset: [9, 15],
				baseSize: [18, 15],
				spans: [
					{
						start: [0, 224],
						gridRect: [1, 1]
					},
					{
						start: [0, 320],
						gridRect: [4, 1]
					},
					{
						start: [0, 352],
						gridRect: [4, 1]
					},
					{
						start: [0, 384],
						gridRect: [7, 1]
					}
				]
			}
		],
		anims: {
			"spawn": {
				frames: spanArray(11, -3)
			},
			"idle": {
				duration: 1,
				frames: [0]
			},
			"move": {
				duration: 2,
				frames: spanArray(1, 4)
			},
			"shoot": {
				frames: [...spanArray(5, 4), ...repeat(8, 4)]
			},
			"die": {
				duration: 1,
				frames: spanArray(9, 7)
			},
		}
	},
	techTiles: {
		path: "sprites/techTiles.png",
		spritesDefs: [
			{
				gridSize: [32, 32],
				actualOffset: [0, 0],
				actualSize: [32, 32],
				baseOffset: [0, 0],
				baseSize: [32, 32],
				spans: [
					{
						start: [0, 0],
						gridRect: [37, 23]
					}
				]
			}
		],
		anims: {}
	},
	cursor: {
		path: "sprites/cursor.png",
		spritesDefs: [
			{
				gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
				baseOffset: [0, 0],
				spans: [
					// Default
					{
						start: [0, 0],
						gridRect: [1, 1]
					},
					// Up-left
					{
						start: [5 * 16, 4 * 16],
						gridRect: [1, 1]
					}
				]
			},
			{
				// Left
				gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
				baseOffset: [0, 8],
				spans: [ { start: [ 0 * 16, 4 * 16 ], gridRect: [1, 1] } ]
			},
			{
				// Right
				gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
				baseOffset: [16, 8],
				spans: [ { start: [ 1 * 16, 4 * 16 ], gridRect: [1, 1] } ]
			},
			{
				// Up
				gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
				baseOffset: [8, 0],
				spans: [ { start: [ 2 * 16, 4 * 16 ], gridRect: [1, 1] } ]
			},
			{
				// Down
				gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
				baseOffset: [8, 16],
				spans: [ { start: [ 3 * 16, 4 * 16 ], gridRect: [1, 1] } ]
			},
			{
				// Up-right
				gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
				baseOffset: [16, 0],
				spans: [ { start: [ 4 * 16, 4 * 16 ], gridRect: [1, 1] } ]
			},
			{
				// Down-right
				gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
				baseOffset: [16, 16],
				spans: [ { start: [ 6 * 16, 4 * 16 ], gridRect: [1, 1] } ]
			},
			{
				// Down-left
				gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
				baseOffset: [0, 16],
				spans: [ { start: [ 7 * 16, 4 * 16 ], gridRect: [1, 1] } ]
			},
		],
		anims: {
			default: {frames: [0]},
			upLeft: {frames: [1]},
			left: {frames: [2]},
			right: {frames: [3]},
			up: {frames: [4]},
			down: {frames: [5]},
			upRight: {frames: [6]},
			downRight: {frames: [7]},
			downLeft: {frames: [8]},
		}
	}
	// worker: {
	// 	path: "sprites/worker.png"
	// },
	// workerOutlined: {
	// 	path: "sprites/workerOutlined.png"
	// },
} satisfies ImageAssets

const maps = {
	m1: {
		tilemapJsonPath: "maps/m1.tmj",
		tileset: "techTiles"
	}
} satisfies Record<string, MapDef>

const assets = {
	images,
	sounds: {
		death: "sounds/death.mp3",
		pulseRifle1: "sounds/pulseRifle1.mp3",
		pulseRifle2: "sounds/pulseRifle2.mp3",
		laserCannon1: "sounds/laserCannon1.mp3",
		laserCannon2: "sounds/laserCannon2.mp3",
		music_spritzTherapy: "music/spritzTherapy.mp3",
		music_aStepCloser: "music/aStepCloser.mp3",
		music_darkfluxxTheme: "music/darkfluxxTheme.mp3",
	},
	maps,
	levels: {
		level1: {
			mapName: "m1",
			cameraUpperLeft: [0, 0],
			units: [
				{
					owner: Owner.PLAYER,
					units: [
						{
							typeId: SerializableId.MARINE,
							instanceArgs: [
								{
									pos: [2.5, 3.5]
								},
								{
									pos: [2.5, 4.5]
								},
								{
									pos: [2.5, 5.5]
								},
								{
									pos: [3.5, 4]
								},
								{
									pos: [3.5, 5]
								},
							]
						} satisfies UnitInfo<typeof Marine>,
						{
							typeId: SerializableId.SARGE,
							instanceArgs: [
								{
									pos: [5, 4.5]
								}
							]
						} satisfies UnitInfo<typeof Sarge>
					]
				},
				{
					owner: Owner.ENEMY,
					units: [
						{
							typeId: SerializableId.MARINE,
							instanceArgs: [
								{
									pos: [10.5, 16.75]
								},
								{
									pos: [2.5, 16.25]
								},
								{
									pos: [29.5, 4.5]
								},
								{
									pos: [25, 5.5]
								},
								{
									pos: [29, 12.5]
								},
								{
									pos: [30, 6.5]
								},
							]
						} satisfies UnitInfo<typeof Marine>,
						{
							typeId: SerializableId.SARGE,
							instanceArgs: [
								{
									pos: [5.5, 16.5]
								},
								{
									pos: [27, 5]
								},
								{
									pos: [19.75, 9]
								}
							]
						} satisfies UnitInfo<typeof Sarge>
					]
				}
			]
		}
	} satisfies Record<string, LevelDef>
}

export type ImageGroupName = Exclude<keyof (typeof assets)["images"], symbol>
export type AnimName<T extends ImageGroupName> = Exclude<keyof (typeof assets)["images"][T]["anims"], symbol>

export default assets
