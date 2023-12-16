import Game from "./Game.js";
import Marine from "./entities/Marine.js";
import World from "./World.js";
import Camera from "./Camera.js";
import { SerializableClock, Tween } from "../engine/clock.js";
import Anim from "./Anim.js";
export function serializableIdToClass(id) {
    switch (id) {
        case 0:
            return Game;
        case 6:
            return Marine;
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
        case 7:
            throw Error("Tried to serialize 1 past the number of IDs");
    }
    throw Error("Invalid serializable ID");
}
export function serialize(root) {
    const classToId = new Map();
    for (let i = 0; i < 7; ++i) {
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
        if (oldVal === null || type === "boolean" || type === "number" || type === "string" || type === "undefined") {
            return oldVal;
        }
        const proto = Object.getPrototypeOf(oldVal);
        const existingIdx = instanceToIdx.get(oldVal);
        if (existingIdx !== undefined)
            return { _: existingIdx };
        if (proto === Array.prototype) {
            const ref = addInstance(oldVal, null);
            const newVal = oldVal.map(e => recurse(e));
            instances[ref._] = newVal;
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
    const serializationInstances = obj[1];
    const instances = [];
    for (let i = 0; i < classIds.length; ++i) {
        const serializationInstance = serializationInstances[i];
        const id = classIds[i];
        if (id === -1) {
            instances.push(serializationInstance);
            continue;
        }
        const proto = serializableIdToClass(id).prototype;
        if (proto.deserializationForm) {
            instances[i] = await proto.deserializationForm(serializationInstance);
            continue;
        }
        Object.setPrototypeOf(serializationInstance, proto);
        instances[i] = serializationInstance;
    }
    for (const instance of instances) {
        for (const key in instance) {
            const ref = instance[key]?._;
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