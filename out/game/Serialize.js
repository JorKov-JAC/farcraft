import Game from "./Game.js";
import Marine from "./entities/Marine.js";
import World from "./World.js";
import Camera from "./Camera.js";
import { SerializableClock, Tween } from "../engine/clock.js";
import Anim from "./Anim.js";
import Sarge from "./entities/Sarge.js";
import Corpse from "./entities/Corpse.js";
export function serializableIdToClass(id) {
    switch (id) {
        case 0:
            return Game;
        case 7:
            return Marine;
        case 8:
            return Sarge;
        case 1:
            return World;
        case 2:
            return Camera;
        case 3:
            return SerializableClock;
        case 4:
            return Tween;
        case 5:
            return Anim;
        case 6:
            return Corpse;
        case 9:
            throw Error("Tried to serialize 1 past the number of IDs");
    }
    throw Error("Invalid serializable ID");
}
export function serialize(root) {
    const classToId = new Map();
    for (let i = 0; i < 9; ++i) {
        classToId.set(serializableIdToClass(i).prototype, i);
    }
    const instanceToIdx = new Map();
    const instances = [];
    function addInstance(oldVal, newVal) {
        const idx = instances.length;
        instanceToIdx.set(oldVal, idx);
        instances.push(newVal);
        return [idx];
    }
    function recurse(oldVal) {
        const type = typeof oldVal;
        if (oldVal === null || type === "boolean" || type === "number" || type === "string" || type === "undefined") {
            return oldVal;
        }
        const proto = Object.getPrototypeOf(oldVal);
        const existingIdx = instanceToIdx.get(oldVal);
        if (existingIdx !== undefined)
            return [existingIdx];
        if (proto === Array.prototype) {
            const ref = addInstance(oldVal, null);
            const newVal = oldVal.map(e => recurse(e));
            instances[ref[0]] = newVal;
            return ref;
        }
        if (proto !== Object.prototype && !classToId.has(proto)) {
            console.group("Not serializing an object with invalid prototype");
            console.dir(oldVal);
            console.groupEnd();
            return undefined;
        }
        const newVal = Object.create(null);
        const ref = addInstance(oldVal, newVal);
        oldVal.preSerialization?.();
        if (oldVal.serializationForm) {
            oldVal = oldVal.serializationForm();
        }
        for (const name of Object.getOwnPropertyNames(oldVal)) {
            newVal[name] = recurse(oldVal[name]);
        }
        return ref;
    }
    recurse(root);
    const oldInstances = Array.from(instanceToIdx.keys());
    const instanceClassIds = oldInstances
        .map(e => e.classId?.() ?? -1);
    for (const e of oldInstances) {
        e.postSerialization?.();
    }
    return JSON.stringify([instanceClassIds, instances]);
}
export async function deserialize(json) {
    const obj = JSON.parse(json);
    const classIds = obj[0];
    const dFormInstances = obj[1];
    const instances = [];
    const symbolsToRefs = new Map();
    for (let i = 0; i < classIds.length; ++i) {
        const dFormInstance = dFormInstances[i];
        for (const key in dFormInstance) {
            const val = dFormInstance[key];
            if (val instanceof Array) {
                const symbol = Symbol();
                symbolsToRefs.set(symbol, val[0]);
                dFormInstance[key] = symbol;
            }
        }
        const id = classIds[i];
        if (id === -1) {
            instances.push(dFormInstance);
            continue;
        }
        const proto = serializableIdToClass(id).prototype;
        if (proto.customDForm) {
            instances[i] = await proto.customDForm(dFormInstance);
            continue;
        }
        Object.setPrototypeOf(dFormInstance, proto);
        instances[i] = dFormInstance;
    }
    for (const instance of instances) {
        for (const key in instance) {
            const ref = symbolsToRefs.get(instance[key]);
            if (ref !== undefined) {
                instance[key] = instances[ref];
            }
        }
    }
    for (const instance of instances) {
        instance.postDeserialize?.();
    }
    return instances[0];
}
//# sourceMappingURL=Serialize.js.map