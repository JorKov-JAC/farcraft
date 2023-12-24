export {}

declare global {
	/**
	 * An object (generally a class) that can construct instances with "new".
	 */
	interface Newable {
		new(...args: any[]): object
	}

	/**
	 * Removes all properties from {@link T} which have a never value.
	 */
	type RemoveNever<T> = Pick<T, {[K in keyof T]-?: Required<T>[K] extends never ? never : K}[keyof T]>

	/**
	 * Converts a union to an intersection.
	 */
	type Intersection<U> = (U extends any ? (a: U) => void : never) extends ((a: infer I) => void) ? I : never

	/**
	 * Converts a type/union to an object containing that type/union. Useful for
	 * debugging with the ts-type-expand VSCode extension.
	 */
	type DebugWrap<T> = T extends any ? {"e": T} : never
}
