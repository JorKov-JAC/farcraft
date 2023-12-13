// Implements the provider pattern.

/**
 * Maps classes and symbols to their currently provided instances.
 * 
 * @type {Map<Newable, object>}
 */
const currentProvidedObjects = new Map()

/**
 * Gets the currently provided instance of {@link class}.
 * 
 * Part of the provider pattern.
 * 
 * @param type The class to get an instance of.
 * @return The currently provided instance.
 */
export function current<T extends Newable>(type: T): InstanceType<T> {
	const instance = currentProvidedObjects.get(type)
	if (instance === undefined) throw Error("There is no provided " + type)

	return /**@type {InstanceType<T>}*/(instance)
}

/**
 * Calls {@link callback} while providing {@link instance} as the current object
 * for the type {@link type}.
 * 
 * Part of the provider pattern.
 * 
 * @param type The type to provide for.
 * @param instance The instance of {@link type} to provide.
 * @param callback The code to run.
 * @return The result of {@link callback}.
 */
export function provide<T extends Newable, R>(type: T, instance: InstanceType<T>, callback: () => R): R {
	const oldInstance = currentProvidedObjects.get(type)

	// Provide the object to the callback
	currentProvidedObjects.set(type, instance)

	let result
	try {
		result = callback()
	} finally {
		// Stop providing the object
		if (oldInstance === undefined) {
			currentProvidedObjects.delete(type)
		} else {
			currentProvidedObjects.set(type, oldInstance)
		}
	}

	return result
}
