export default abstract class GameState {
	abstract update(dt: number): void

	// Rendering is handled by the UI:
	// abstract render(): void

	enter() {}
	exit() {}
}
