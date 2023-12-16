export default class GameStateManager {
    state;
    loadingScreenCreator;
    loadingState;
    constructor(loadingScreenCreator) {
        this.loadingScreenCreator = loadingScreenCreator;
        this.state = loadingScreenCreator();
        this.loadingState = null;
    }
    async switch(newState) {
        this.state.exit();
        this.state = this.loadingScreenCreator();
        this.loadingState = newState;
        return await newState.then(e => {
            if (newState !== this.loadingState)
                return false;
            this.state = e;
            e.enter();
            return true;
        });
    }
    update(dt) {
        this.state.update(dt);
    }
}
export class GameState {
    enter() { }
    exit() { }
}
//# sourceMappingURL=GameState.js.map