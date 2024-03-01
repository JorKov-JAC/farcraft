import { provide } from "../../engine/Provider.js";
import { Panel } from "../../engine/ui/Panel.js";
import { ScreenCoord } from "../../engine/ui/ScreenCoord.js";
import { uiClock } from "../../global.js";
import Game from "../Game.js";
import CommandMap from "./hud/CommandMap.js";
import Minimap from "./hud/Minimap.js";
import UnitList from "./hud/UnitList.js";
import WorldPanel from "./hud/WorldPanel.js";

/** UI which displays gameplay and a HUD to the user. */
export default class Hud extends Panel {
	game: Game
	worldPanel: WorldPanel

	constructor(pos: ScreenCoord, size: ScreenCoord, game: Game) {
		super(pos, size)
		this.game = game

		game.camera.extraYMult = .05 / .8
		this.worldPanel = new WorldPanel(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, .8), game)

		const minimap = new Minimap(ScreenCoord.rect(0, 1).addSq(-.25, -.25), ScreenCoord.sq(.25, .25))
		const commandMap = new CommandMap(ScreenCoord.rect(1, 1).addSq(0, -.25), ScreenCoord.sq(.25, .25))
		const unitList = new UnitList(ScreenCoord.rect(0, 1).addSq(.25, 0), ScreenCoord.rect(1, .2).addSq(-.5, 0))

		// Tween in the HUD components
		// HACK Tween things we aren't supposed to access
		void uiClock.tween(minimap, {pos: {sq: [0]}}, 1)
		void uiClock.tween(commandMap, {pos: {sq: [-.25]}}, 1)
		void uiClock.tween(unitList, {pos: {rect: {1: .8}}}, 1)

		const children = [
			this.worldPanel,
			minimap,
			commandMap,
			unitList
		]
		this.addChildren(...children)
	}
	
	override baseUpdate(dt: number) {
		// Provide the game to child components
		provide(Game, this.game, () => {
			super.baseUpdate(dt)
		})
	}

	override baseRender() {
		// Provide the game to child components
		provide(Game, this.game, () => {
			super.baseRender()
		})
	}
	override renderImpl(): void {}
}
