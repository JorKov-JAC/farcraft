export default class GameStateManager {
	state: GameState

	loadingScreenCreator: () => GameState
	loadingState: Promise<GameState> | null

	constructor(loadingScreenCreator: () => GameState) {
		this.loadingScreenCreator = loadingScreenCreator
		this.state = loadingScreenCreator()
		this.state.enter()

		this.loadingState = null
	}

	async switch(newState: Promise<GameState>): Promise<boolean> {
		this.state.exit()
		this.state = this.loadingScreenCreator()
		this.state.enter()

		this.loadingState = newState
		return await newState.then(e => {
			if (newState !== this.loadingState) return false

			this.state = e
			e.enter()

			return true
		})
	}

	update(dt: number) {
		this.state.update(dt)
	}
}

export abstract class GameState {
	abstract update(dt: number): void

	// Rendering is handled by the UI:
	// abstract render(): void

	enter() {}
	exit() {}
}
