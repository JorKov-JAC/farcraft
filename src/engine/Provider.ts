// Implements the provider pattern.

declare const providerSymbolTag: unique symbol
export type ProviderKey<T> = symbol & {[providerSymbolTag]: T}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createProviderKey<T>() {
	return Symbol() as ProviderKey<T>
}

type Providable = Newable | ProviderKey<unknown>
type ProvidedTypeOf<T extends Providable>
	= T extends ProviderKey<unknown>
			? T[typeof providerSymbolTag]
		: T extends Newable
			? InstanceType<T>
			: never

/**
 * Maps classes and symbols to their currently provided instances.
 */
const currentProvidedObjects: Map<Newable | ProviderKey<any>, object> = new Map()

/**
 * Gets the currently provided instance of {@link class}.
 * 
 * Part of the provider pattern.
 * 
 * @param type The class to get an instance of.
 * @return The currently provided instance.
 */
export function current<T extends Providable>(type: T) : ProvidedTypeOf<T> {
	const instance = currentProvidedObjects.get(type)
	if (instance === undefined) throw Error("No provided value")

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return instance as any
}

/**
 * Calls {@link callback} while providing {@link instance} as the current object
 * for the type {@link key}.
 * 
 * Part of the provider pattern.
 * 
 * @param key The type to provide for.
 * @param instance The instance of {@link key} to provide.
 * @param callback The code to run.
 * @return The result of {@link callback}.
 */
export function provide<T extends Providable, R>(key: T, instance: ProvidedTypeOf<T>, callback: () => R): R {
	const oldInstance = currentProvidedObjects.get(key)

	// Provide the object to the callback
	currentProvidedObjects.set(key, instance)

	let result
	try {
		result = callback()
	} finally {
		// Stop providing the object
		if (oldInstance === undefined) {
			currentProvidedObjects.delete(key)
		} else {
			currentProvidedObjects.set(key, oldInstance)
		}
	}

	return result
}
