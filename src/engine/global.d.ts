export {}

declare global {
	/**
	 * An object (generally a class) that can construct instances with "new".
	 */
	interface Newable {
		new(...args: any[]): object
	}
}
