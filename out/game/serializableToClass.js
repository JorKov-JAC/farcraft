import Game from "./Game.js";
import Marine from "./entities/Marine.js";
import World from "./World.js";
import Camera from "./Camera.js";
export function serializableIdToClass(id) {
    switch (id) {
        case 0:
            return Game;
        case 3:
            return Marine;
        case 1:
            return World;
        case 2:
            return Camera;
        case 4:
            throw Error("Tried to serialize 1 past the number of IDs");
    }
}
//# sourceMappingURL=serializableToClass.js.map