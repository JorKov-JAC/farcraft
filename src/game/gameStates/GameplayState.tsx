import assets from "../../assets.js";
import FactoryBuilder from "../../engine/Factory.js";
import { GameState } from "../../engine/GameState.js";
import UiTree from "../../engine/ui/UiTree.js";
import { replaceUi, uiSounds } from "../../global.js";
import Game from "../Game.js";
import { deserialize, serialize } from "../Serialize.js";

export default class GameplayState extends GameState {
	static SAVE_LOCAL_STORAGE_KEY = "save"

	game: Game

	private constructor(game: Game) {
		super()
		this.game = game
	}

	override enter(): void {
		const ui = new UiTree()
		ui.panels.push(this.game.hud)
		replaceUi(ui)
		uiSounds.playSoundtrackUntilStopped(["music_aStepCloser", "music_darkfluxxTheme"])
	}

	static async newGame() {
		const levelDef = assets.levels.level1

		const game = await Game.create(levelDef.mapName)
		game.camera.worldPos.mut().set(...levelDef.cameraUpperLeft)

		for (const ownersUnits of levelDef.units) {
			const ownerFb = new FactoryBuilder({owner: ownersUnits.owner})

			for (const unitTypeGroup of ownersUnits.units) {
				const constructor = unitTypeGroup.constructor

				for (const args of unitTypeGroup.instanceArgs) {
					const factory = ownerFb.with(args).forClass<typeof constructor>(constructor)
					game.world.ents.push(factory.spawn())
				}
			}
		}

		return new GameplayState(game)
	}

	static saveExists() {
		return localStorage.getItem(GameplayState.SAVE_LOCAL_STORAGE_KEY) !== null
	}

	static tryLoadGame(): GameplayState | null {
		try {
			const game = deserialize(localStorage.getItem("save") as string) as unknown as Game
			if (!(game instanceof Game)) {
				console.groupCollapsed("Deserialized successfully, but wasn't a game")
				console.dir(game)
				console.groupEnd()
				return null
			}

			return new GameplayState(game)
		} catch (e) {
			console.groupCollapsed("Couldn't deserialize game")
			console.dir(e)
			console.groupEnd()
			return null
		}
	}

	override update(dt: number): void {
		this.game.update(dt)
	}

	saveGame(): boolean {
		try {
			localStorage.setItem(GameplayState.SAVE_LOCAL_STORAGE_KEY, serialize(this.game))
			return true
		} catch (e) {
			console.groupCollapsed("Failed to save game")
			console.dir(e)
			console.groupEnd()
			return false
		}
	}
}
