import assets from "../assets.js"

const assetImages: Record<keyof typeof assets["images"], Promise<HTMLImageElement>> = Object.create(null)

function loadImage(src: string): Promise<HTMLImageElement> {
	const img = new Image()

	const promise = new Promise((resolve, reject) => {
		img.onload = () => resolve(img)
		img.onerror = reject
	}) as Promise<HTMLImageElement>

	img.src = src

	return promise
}

/**
 * Gets the image asset with the given name.
 */
export function getImage(name: keyof typeof assets["images"]): Promise<HTMLImageElement> {
	return assetImages[name] ??= loadImage("assets/" + assets.images[name])
}
