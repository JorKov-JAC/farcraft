import { repeat, spanArray } from "./engine/util.js";
const images = {
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
                    {
                        start: [0, 0],
                        gridRect: [1, 1]
                    },
                    {
                        start: [5 * 16, 4 * 16],
                        gridRect: [1, 1]
                    }
                ]
            },
            {
                gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
                baseOffset: [0, 8],
                spans: [{ start: [0 * 16, 4 * 16], gridRect: [1, 1] }]
            },
            {
                gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
                baseOffset: [16, 8],
                spans: [{ start: [1 * 16, 4 * 16], gridRect: [1, 1] }]
            },
            {
                gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
                baseOffset: [8, 0],
                spans: [{ start: [2 * 16, 4 * 16], gridRect: [1, 1] }]
            },
            {
                gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
                baseOffset: [8, 16],
                spans: [{ start: [3 * 16, 4 * 16], gridRect: [1, 1] }]
            },
            {
                gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
                baseOffset: [16, 0],
                spans: [{ start: [4 * 16, 4 * 16], gridRect: [1, 1] }]
            },
            {
                gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
                baseOffset: [16, 16],
                spans: [{ start: [6 * 16, 4 * 16], gridRect: [1, 1] }]
            },
            {
                gridSize: [16, 16], actualOffset: [0, 0], actualSize: [16, 16], baseSize: [16, 16],
                baseOffset: [0, 16],
                spans: [{ start: [7 * 16, 4 * 16], gridRect: [1, 1] }]
            },
        ],
        anims: {
            default: { frames: [0] },
            upLeft: { frames: [1] },
            left: { frames: [2] },
            right: { frames: [3] },
            up: { frames: [4] },
            down: { frames: [5] },
            upRight: { frames: [6] },
            downRight: { frames: [7] },
            downLeft: { frames: [8] },
        }
    }
};
const maps = {
    m1: {
        tilemapJsonPath: "maps/m1.tmj",
        tileset: "techTiles"
    }
};
const assets = {
    images,
    sounds: {
        marineDeath: "sounds/marineDeath.mp3",
        sargeDeath: "sounds/sargeDeath.mp3",
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
                    owner: 0,
                    units: [
                        {
                            typeId: 6,
                            instanceArgs: [
                                {
                                    pos: [2.5, 3.5],
                                    angle: 0
                                },
                                {
                                    pos: [2.5, 4.5],
                                    angle: 0
                                },
                                {
                                    pos: [2.5, 5.5],
                                    angle: 0
                                },
                                {
                                    pos: [3.5, 4],
                                    angle: 0
                                },
                                {
                                    pos: [3.5, 5],
                                    angle: 0
                                },
                            ]
                        },
                        {
                            typeId: 7,
                            instanceArgs: [
                                {
                                    pos: [5, 4.5],
                                    angle: 0
                                }
                            ]
                        }
                    ]
                },
                {
                    owner: 1,
                    units: [
                        {
                            typeId: 6,
                            instanceArgs: [
                                {
                                    pos: [10.5, 16.75],
                                    angle: 0
                                },
                                {
                                    pos: [2.5, 16.25],
                                    angle: 0
                                },
                                {
                                    pos: [29.5, 4.5],
                                    angle: Math.PI
                                },
                                {
                                    pos: [25, 5.5],
                                    angle: Math.PI
                                },
                                {
                                    pos: [29, 12.5],
                                    angle: 0
                                },
                                {
                                    pos: [30, 6.5],
                                    angle: Math.PI
                                },
                            ]
                        },
                        {
                            typeId: 7,
                            instanceArgs: [
                                {
                                    pos: [5.5, 16.5],
                                    angle: 0
                                },
                                {
                                    pos: [27, 5],
                                    angle: Math.PI
                                },
                                {
                                    pos: [19.75, 9],
                                    angle: Math.PI
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
};
export default assets;
//# sourceMappingURL=assets.js.map