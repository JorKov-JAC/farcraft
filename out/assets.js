import { spanArray } from "./engine/util.js";
export default {
    images: {
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
    },
    sounds: {
        death: "sounds/death.mp3",
        music_aStepCloser: "music/aStepCloser.mp3",
        music_darkfluxxTheme: "music/darkfluxxTheme.mp3",
    }
};
//# sourceMappingURL=assets.js.map