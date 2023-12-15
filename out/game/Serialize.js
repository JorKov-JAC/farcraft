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
export function serialize(root) {
    const classToId = new Map();
    for (let i = 0; i < 4; ++i) {
        classToId.set(serializableIdToClass(i).prototype, i);
    }
    const instanceToIdx = new Map();
    const instances = [];
    function addInstance(oldVal, newVal) {
        const idx = instances.length;
        instanceToIdx.set(oldVal, idx);
        instances.push(newVal);
        return { _: idx };
    }
    function recurse(oldVal) {
        const type = typeof oldVal;
        if (type === "boolean" || type === "number" || type === "string" || type === "undefined") {
            return oldVal;
        }
        const proto = Object.getPrototypeOf(oldVal);
        const existingIdx = instanceToIdx.get(oldVal);
        if (existingIdx !== undefined)
            return { _: existingIdx };
        if (proto === Array) {
            const ref = addInstance(oldVal, null);
            const newVal = oldVal.map(e => recurse(e));
            instances[ref._] = newVal;
            return ref;
        }
        if (!classToId.has(proto))
            return undefined;
        const newVal = Object.create(null);
        const ref = addInstance(oldVal, newVal);
        if (oldVal.prepareForSerialization) {
            oldVal = oldVal.prepareForSerialization();
        }
        for (const name of Object.getOwnPropertyNames(oldVal)) {
            newVal[name] = recurse(oldVal[name]);
        }
        return ref;
    }
    recurse(root);
    const instanceClassIds = Array
        .from(instanceToIdx.keys())
        .map(e => e.classId?.() ?? -1);
    return JSON.stringify([instanceClassIds, instances]);
}
//# sourceMappingURL=Serialize.js.map