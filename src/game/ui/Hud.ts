import { provide } from "../../engine/Provider.js";
import { Panel } from "../../engine/ui/Panel.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import Game from "../Game.js";
import CommandMap from "./hud/CommandMap.js";
import Minimap from "./hud/Minimap.js";
import UnitList from "./hud/UnitList.js";
import WorldPanel from "./hud/WorldPanel.js";

export default class Hud extends Panel {
	game: Game
	worldPanel: WorldPanel

	constructor(pos: ScreenCoord, size: ScreenCoord, game: Game) {
		super(pos, size)
		this.game = game

		game.camera.extraYMult = .05 / .8
		this.worldPanel = new WorldPanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, .8), game)

		const minimap = new Minimap(ScreenCoord.rect(0, 1).setSq(0, -.25), ScreenCoord.sq(.25, .25))
		const commandMap = new CommandMap(ScreenCoord.rect(1, 1).setSq(-.25, -.25), ScreenCoord.sq(.25, .25))
		const unitList = new UnitList(ScreenCoord.rect(0, .8).setSq(.25, 0), ScreenCoord.rect(1, .2).setSq(-.5, 0))

		const children = [
			this.worldPanel,
			minimap,
			commandMap,
			unitList
		]
		this.children.push(...children)
	}
	
	override baseUpdate(dt: number) {
		provide(Game, this.game, () => {
			super.baseUpdate(dt)
		})
	}

	override baseRender() {
		provide(Game, this.game, () => {
			super.baseRender()
		})
	}
	override renderImpl(): void {}
}
