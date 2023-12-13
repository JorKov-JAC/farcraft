export function loadImage(src) {
    const img = new Image();
    const promise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
    img.src = src;
    return promise;
}
export class ImageManager {
    namesToImages;
    constructor(namesToImages) {
        this.namesToImages = namesToImages;
    }
    static async create(imageAssets) {
        const names = [];
        const promises = [];
        for (const assetName in imageAssets) {
            names.push(assetName);
            const path = "assets/" + imageAssets[assetName];
            promises.push(loadImage(path));
        }
        const images = await Promise.all(promises);
        const namesToImages = new Map();
        for (let i = 0; i < names.length; ++i) {
            namesToImages.set(names[i], images[i]);
        }
        return new ImageManager(namesToImages);
    }
    getImage(name) {
        return this.namesToImages.get(name);
    }
}
//# sourceMappingURL=images.js.map