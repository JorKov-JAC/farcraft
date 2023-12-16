export default class FactoryBuilder<T = {}> {
	args: T

	constructor(args: T = {} as T) {
		this.args = args
	}

	with<U>(newArgs: U): FactoryBuilder<Omit<T, keyof U> & U> {
		return new FactoryBuilder({...this.args, ...newArgs})
	}

	for<R>(createCallback: (a: T) => R): Factory<R> {
		return new Factory(createCallback, this.args)
	}

	forClass<R extends Newable>(newable: {new(a: T): InstanceType<R>}): Factory<InstanceType<R>> {
		return new Factory((a: T) => new newable(a), this.args)
	}
}

export class Factory<T> {
	private createCallback: (a: Record<keyof any, unknown>) => T
	private args: any

	constructor(createCallback: (...a: any[]) => T, args: any) {
		this.createCallback = createCallback
		this.args = args
	}

	spawn(): T {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		return this.createCallback(this.args)
	}
}
