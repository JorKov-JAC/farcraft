export function createProviderKey() {
    return Symbol();
}
const currentProvidedObjects = new Map();
export function current(type) {
    const instance = currentProvidedObjects.get(type);
    if (instance === undefined)
        throw Error("No provided value");
    return instance;
}
export function provide(key, instance, callback) {
    const oldInstance = currentProvidedObjects.get(key);
    currentProvidedObjects.set(key, instance);
    let result;
    try {
        result = callback();
    }
    finally {
        if (oldInstance === undefined) {
            currentProvidedObjects.delete(key);
        }
        else {
            currentProvidedObjects.set(key, oldInstance);
        }
    }
    return result;
}
//# sourceMappingURL=Provider.js.map