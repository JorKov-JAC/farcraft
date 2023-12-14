import { raise } from "./util.js";
import { v2 } from "./vector.js";
export function loadImage(src) {
    const img = new Image();
    const promise = new Promise((resolve, reject) => {
        img.onload = () => { resolve(img); };
        img.onerror = reject;
    });
    img.src = src;
    return promise;
}
async function createSpriteInfo(image, imageAsset) {
    const sprites = [];
    for (const spritesDef of imageAsset.spritesDefs) {
        for (const span of spritesDef.spans) {
            const totalRectTileCount = span.gridRect.rectArea();
            let remaining = Math.min(span.count ?? totalRectTileCount, totalRectTileCount);
            const coord = v2(0, 0);
            getTiles: for (let row = 0; row < span.gridRect[1]; ++row) {
                for (let col = 0; col < span.gridRect[0]; ++col) {
                    if (--remaining < 0)
                        break getTiles;
                    coord.mut()
                        .set(...span.start)
                        .add([
                        spritesDef.gridSize[0] * col,
                        spritesDef.gridSize[1] * row
                    ])
                        .add(spritesDef.actualOffset);
                    const bitmap = await createImageBitmap(image, ...coord, ...spritesDef.actualSize, { resizeQuality: "pixelated" });
                    const offset = spritesDef.baseOffset.slice().neg().lock();
                    const size = spritesDef.baseSize.slice().lock();
                    sprites.push({ bitmap, offset, size });
                }
            }
        }
    }
    const animFrames = Object.create(null);
    const animDefs = imageAsset.anims;
    for (const animName in animDefs) {
        const animDef = animDefs[animName];
        const frames = animDef.frames.map(spriteIdx => sprites[spriteIdx] ?? raise(Error(`Sprite index ${spriteIdx} not found.`)));
        const anim = { frames };
        if ("duration" in animDef)
            anim.duration = animDef.duration;
        animFrames[animName] = anim;
    }
    return { image, sprites, animFrames };
}
export class ImageManager {
    namesToSpriteInfos;
    constructor(namesToSpriteInfos) {
        this.namesToSpriteInfos = namesToSpriteInfos;
    }
    static async create(imageAssets) {
        const names = [];
        const imagePromises = [];
        for (const assetName in imageAssets) {
            names.push(assetName);
            const path = "assets/" + imageAssets[assetName].path;
            imagePromises.push(loadImage(path));
        }
        const images = await Promise.all(imagePromises);
        const namesToImages = Object.create(null);
        for (let i = 0; i < names.length; ++i) {
            namesToImages[names[i]] = images[i];
        }
        const namesToImageInfos = Object.create(null);
        for (const assetName in imageAssets) {
            const imageAssetDef = imageAssets[assetName];
            const image = namesToImages[assetName];
            const spriteInfo = createSpriteInfo(image, imageAssetDef);
            namesToImageInfos[assetName] = await spriteInfo;
        }
        return new ImageManager(namesToImageInfos);
    }
    getImage(name) {
        return this.namesToSpriteInfos[name].image;
    }
    getAnim(spriteName, animName) {
        return this.namesToSpriteInfos[spriteName].animFrames[animName];
    }
}
//# sourceMappingURL=images.js.map