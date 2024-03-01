import assets, { type LevelDef } from "../../assets.js";
import FactoryBuilder from "../../engine/Factory.js";
import GameState from "../../engine/GameState.js";
import UiTree from "../../engine/ui/UiTree.js";
import { replaceUi, uiSounds } from "../../global.js";
import Game from "../Game.js";
import { deserialize, serializableIdToClass, serialize } from "../Serialize.js";

/** State machine state for the main game. */
export default class GameplayState extends GameState {
	/** The key in localStorage for saved game data. */
	static SAVE_LOCAL_STORAGE_KEY = "FarCraft_save"

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

	/**
	 * Starts a new game.
	 * 
	 * @return Resolves to the new game state.
	 */
	static async newGame() {
		const levelDef = assets.levels.level1 as LevelDef

		const game = await Game.create(levelDef.mapName)
		game.camera.worldPos.mut().set(...levelDef.cameraUpperLeft)

		// Instantiate units using the factory pattern
		for (const ownersUnits of levelDef.units) {
			const ownerFb = new FactoryBuilder({owner: ownersUnits.owner, angle: 0})

			for (const unitTypeGroup of ownersUnits.units) {
				const constructor = serializableIdToClass(unitTypeGroup.typeId)

				for (const args of unitTypeGroup.instanceArgs) {
					const factory = ownerFb.with(JSON.parse(JSON.stringify(args)))
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
						.forClass<any>(constructor as any)
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					game.world.ents.push(factory.spawn())
				}
			}
		}

		return new GameplayState(game)
	}

	/** Checks if there is save data for a saved game. */
	static saveExists() {
		return localStorage.getItem(GameplayState.SAVE_LOCAL_STORAGE_KEY) !== null
	}

	/**
	 * Attempts to load the saved game.
	 * 
	 * @return Resolves to the loaded game, or null if it could not be loaded.
	 */
	static async tryLoadGame(): Promise<GameplayState | null> {
		try {
			const game = await deserialize(localStorage.getItem(this.SAVE_LOCAL_STORAGE_KEY) as string) as unknown as Game
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

	/**
	 * Saves the game so that it can later be loaded with {@link tryLoadGame}.
	 */
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
