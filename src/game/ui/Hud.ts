import { Panel } from "../../engine/ui/Panel.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import Camera from "../Camera.js";
import Minimap from "./hud/Minimap.js";

export default class Hud extends Panel {
	constructor(pos: ScreenCoord, size: ScreenCoord, camera: Camera) {
		super(pos, size)

		camera.pos = ScreenCoord.rect(0, 0)
		camera.size = ScreenCoord.rect(1, .8)
		camera.extraYMult = .05 / .8

		const children = [
			camera,
			new Minimap(ScreenCoord.rect(0, 1).setSq(0, -.25), ScreenCoord.sq(.25, .25))
		]
		this.children.push(...children)
	}

	override renderImpl(): void {}
}
