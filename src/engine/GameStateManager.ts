import GameState from "./GameState";

export default class GameStateManager {
	state: GameState;

	loadingScreenCreator: () => GameState;
	loadingState: Promise<GameState> | null;

	constructor(loadingScreenCreator: () => GameState) {
		this.loadingScreenCreator = loadingScreenCreator;
		this.state = loadingScreenCreator();
		this.state.enter();

		this.loadingState = null;
	}

	async switch(newState: Promise<GameState>): Promise<boolean> {
		if (this.loadingState) return false
		this.state.exit();
		this.state = this.loadingScreenCreator();
		this.state.enter();

		this.loadingState = newState;
		return await newState.then(e => {
			if (newState !== this.loadingState) return false;
			this.loadingState = null

			this.state = e;
			e.enter();

			return true;
		});
	}

	update(dt: number) {
		this.state.update(dt);
	}
}
