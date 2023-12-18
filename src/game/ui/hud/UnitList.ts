import { current } from "../../../engine/Provider.js";
import { ScreenCoord } from "../../../engine/ui/ScreenCoord.js";
import Game from "../../Game.js";
import ArmyEntity from "../../entities/ArmyEntity.js";
import TechPanel from "../TechPanel.js";
import ArmyEntityCard from "./ArmyEntityCard.js";

export default class UnitList extends TechPanel {
	currentCards: Map<ArmyEntity<any>, ArmyEntityCard> = new Map()

	override baseUpdate(dt: number): void {
		const game = current(Game)
		this.updateCards(game.getSelectedEnts())
		super.baseUpdate(dt)
	}

	updateCards(ents: Iterable<ArmyEntity<any>>) {
		const missingEnts = new Set(this.currentCards.keys())
		for (const e of ents) {
			if (missingEnts.delete(e)) continue
			const card = new ArmyEntityCard(ScreenCoord.rect(0, 0), ScreenCoord.rect(1, 1), e)
			this.currentCards.set(e, card)
			this.addChildren(card)
		}

		for (const e of missingEnts.keys()) {
			const card = this.currentCards.get(e)!
			this.currentCards.delete(e)
			this.removeChild(card)
		}
	}
}
