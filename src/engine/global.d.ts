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
}
