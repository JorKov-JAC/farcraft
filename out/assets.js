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
                duration: 1,
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
                duration: 1,
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
                gridSize: [16, 16],
                actualOffset: [0, 0],
                actualSize: [16, 16],
                baseOffset: [0, 0],
                baseSize: [16, 16],
                spans: [
                    {
                        start: [0, 0],
                        gridRect: [1, 1]
                    }
                ]
            }
        ],
        anims: {
            "default": { frames: [0] }
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
                    owner: 0,
                    units: [
                        {
                            typeId: 6,
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
                        },
                        {
                            typeId: 7,
                            instanceArgs: [
                                {
                                    pos: [5, 4.5]
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
                        },
                        {
                            typeId: 7,
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
                        }
                    ]
                }
            ]
        }
    }
};
export default assets;
//# sourceMappingURL=assets.js.map