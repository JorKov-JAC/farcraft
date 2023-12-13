import assets from "../assets.js";
const assetImages = Object.create(null);
function loadImage(src) {
    const img = new Image();
    const promise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
    img.src = src;
    return promise;
}
export function getImage(name) {
    return assetImages[name] ??= loadImage("assets/" + assets.images[name]);
}
//# sourceMappingURL=images.js.map