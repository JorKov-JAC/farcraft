export {}

declare global {
	// "unique symbol"s to prevent confusing keyof:
	const __base: unique symbol;
	const __tag: unique symbol;

	/**
	 * Any "newtype"
	 */
	type Tagged = {[__tag]:any, [__base]:any};
	/**
	 * Gets the base type of the given "newtype" {@link T}
	 */
	type NoTag<T> = T extends Tagged ? T[typeof __base] : T;
	/**
	 * Creates a "newtype" based on {@link T} with the given tag {@link B}
	 */
	type Tag<T, B extends string | symbol> = T extends Tagged
		? T[typeof __base] & {[__base]:T[typeof __base], [__tag]:(T[typeof __tag] & {[key in B]:any})}
		: T & {[__base]:T, [__tag]:{[key in B]:any}};
	/**
	 * Removes the given tag {@link B} from a "newtype" {@link T}
	 */
	type Untag<T, B extends string | symbol> = T extends Tagged
		? Omit<T, typeof __tag> & {[__tag]: Omit<T[typeof __tag], B>}
		: T;
	/**
	 * Applies the tags {@link B} to the base type of the "newtype" {@link T}.
	 */
	type Retag<T, B extends string | symbol> = Tag<NoTag<T>, B>;

	const __mut: unique symbol;
	/**
	 * An explicitly mutable version of the given type {@link T}.
	 */
	type Mut<T> = Tag<T, typeof __mut>
}
