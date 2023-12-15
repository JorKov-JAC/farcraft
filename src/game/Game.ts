import assets from "../assets.js";
import { Panel } from "../engine/ui/Panel.js";
import Camera from "./Camera.js";
import World from "./World.js";

export default abstract class Game {
	readonly panel: Panel
	world: World

	private constructor(panel: Panel, world: World) {
		this.panel = panel
		this.world = world
	}

	static async create(mapName: keyof typeof assets["maps"]) {
		return new Game(panel, world)
	}

	update(dt) {
		
	}
}
