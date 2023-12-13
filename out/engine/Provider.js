const currentProvidedObjects = new Map();
export function current(type) {
    const instance = currentProvidedObjects.get(type);
    if (instance === undefined)
        throw Error("There is no provided " + type);
    return (instance);
}
export function provide(type, instance, callback) {
    const oldInstance = currentProvidedObjects.get(type);
    currentProvidedObjects.set(type, instance);
    let result;
    try {
        result = callback();
    }
    finally {
        if (oldInstance === undefined) {
            currentProvidedObjects.delete(type);
        }
        else {
            currentProvidedObjects.set(type, oldInstance);
        }
    }
    return result;
}
//# sourceMappingURL=Provider.js.map