export default class GameStateManager {
    state;
    loadingScreenCreator;
    loadingState;
    constructor(loadingScreenCreator) {
        this.loadingScreenCreator = loadingScreenCreator;
        this.state = loadingScreenCreator();
        this.state.enter();
        this.loadingState = null;
    }
    async switch(newState) {
        if (this.loadingState)
            return false;
        this.state.exit();
        this.state = this.loadingScreenCreator();
        this.state.enter();
        this.loadingState = newState;
        return await newState.then(e => {
            if (newState !== this.loadingState)
                return false;
            this.loadingState = null;
            this.state = e;
            e.enter();
            return true;
        });
    }
    update(dt) {
        this.state.update(dt);
    }
}
//# sourceMappingURL=GameStateManager.js.map