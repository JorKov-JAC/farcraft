export default class FactoryBuilder {
    args;
    constructor(args = {}) {
        this.args = args;
    }
    with(newArgs) {
        return new FactoryBuilder({ ...this.args, ...newArgs });
    }
    for(createCallback) {
        return new Factory(createCallback, this.args);
    }
    forClass(newable) {
        return new Factory((a) => new newable(a), this.args);
    }
}
export class Factory {
    createCallback;
    args;
    constructor(createCallback, args) {
        this.createCallback = createCallback;
        this.args = args;
    }
    spawn() {
        return this.createCallback(this.args);
    }
}
//# sourceMappingURL=Factory.js.map