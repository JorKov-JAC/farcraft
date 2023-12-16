import { SerializableId } from "./SerializableId";

import Game from "./Game.js";
import Marine from "./entities/Marine.js";
import World from "./World.js";
import Camera from "./Camera.js";
import Serializable from "./Serializable.js";


export function serializableIdToClass(id: SerializableId): unknown {
	// Completeness is statically checked by eslint
	switch (id) {
		case SerializableId.GAME:
			return Game;
		case SerializableId.MARINE:
			return Marine;
		case SerializableId.WORLD:
			return World
		case SerializableId.CAMERA:
			return Camera
		case SerializableId._SIZE:
			throw Error("Tried to serialize 1 past the number of IDs")
	}

	throw Error("Invalid serializable ID")
}

export type SerializationSafe = number|string|boolean|{_:number}|undefined|null

export function serialize(root: Serializable<any> | Array<any>): string {
	const classToId = new Map();
	for (let i = 0 as SerializableId; i < SerializableId._SIZE; ++i) {
		classToId.set((serializableIdToClass(i) as Newable).prototype, i);
	}

	const instanceToIdx = new Map();

	const instances: any[] = [];

	function addInstance(oldVal: unknown, newVal: unknown): {_: number} {
		const idx = instances.length
		instanceToIdx.set(oldVal, idx)
		instances.push(newVal)
		return {_: idx}
	}

	function recurse(oldVal: unknown): SerializationSafe {
		const type = typeof oldVal
		if (oldVal === null || type === "boolean" || type === "number" || type === "string" || type === "undefined") {
			return oldVal as SerializationSafe
		}

		const proto = Object.getPrototypeOf(oldVal);

		const existingIdx = instanceToIdx.get(oldVal)
		if (existingIdx !== undefined) return {_: existingIdx}

		if (proto === Array) {
			// Add to the instances before we're done actually recursing it
			const ref = addInstance(oldVal, null)
			const newVal = (oldVal as Array<unknown>).map(e => recurse(e))
			instances[ref._] = newVal
			return ref
		}

		if (proto !== Object && !classToId.has(proto)) {
			console.group("Not serializing an object with invalid prototype")
			console.dir(oldVal)
			console.groupEnd()
			return undefined
		}

		// Add to the instances before we're done actually recursing it
		const newVal: Record<keyof any, SerializationSafe> = Object.create(null)
		const ref = addInstance(oldVal, newVal)

		;(oldVal as Serializable<any, any>).preSerialization?.()
		if ((oldVal as Serializable<any>).serializationForm) {
			oldVal = (oldVal as Serializable<any, any>).serializationForm!()
		}

		for (const name of Object.getOwnPropertyNames(oldVal)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			newVal[name] = recurse((oldVal as any)[name])
		}

		return ref
	}

	recurse(root)
	const oldInstances = Array.from(instanceToIdx.keys())
	const instanceClassIds: number[] = oldInstances
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		.map(e => (e.classId?.() as number | undefined) ?? -1)
	// const instanceClassIds: number[] = oldInstances
	// 	.map(e => {
	// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	// 		const classId = (e.classId?.() as number | undefined)
	// 		if (classId === undefined) {
	// 			const proto = Object.getPrototypeOf(e)
	// 			if (proto !== Array && proto !== Object) {
	// 				console.group("Serialized object with invalid prototype")
	// 				console.dir(e)
	// 				console.groupEnd()
	// 			}
	// 			return -1
	// 		}
	// 		return classId
	// 	})
	return JSON.stringify([instanceClassIds, instances])
}

export async function deserialize(json: string): Promise<object | unknown[]> {
	const obj = JSON.parse(json)
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	const classIds = obj[0] as number[]
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	const serializationInstances = obj[1] as SerializationSafe[]

	const instances = [] as any[]

	for (let i = 0; i < classIds.length; ++i) {
		const serializationInstance = serializationInstances[i]!
		const id = classIds[i]!

		if (id === -1) {
			instances.push(serializationInstance)
			continue
		}

		const proto = (serializableIdToClass(id) as Newable).prototype as Serializable<any>
		if (proto.deserializationForm) {
			instances[i] = await proto.deserializationForm(serializationInstance)
			continue
		}

		Object.setPrototypeOf(serializationInstance, proto)
		instances[i] = serializationInstance
	}

	for (const instance of instances) {
		for (const key in instance) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			const ref = instance[key]?._
			if (ref !== undefined) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				instance[key] = instances[ref]
			}
		}
	}

	for (const instance of instances) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(instance as Serializable<any>).postDeserialize?.()
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return instances[0]
}
