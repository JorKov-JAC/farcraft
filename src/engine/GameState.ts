export default class GameStateManager {
	state: GameState

	constructor(state: GameState) {
		this.state = state
		state.enter()
	}

	switch(newState: GameState) {
		this.state.exit()
		this.state = newState
		newState.enter()
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
