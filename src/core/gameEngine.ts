import {
    ContaminationAction,
    GameAction, GameActionType,
    MovementsAction,
    SiegeEndAction,
    SiegeStartAction,
    TurnState
} from '../model/actions';
import { strings } from '../components/locale/strings';
import { allCharacters, Character } from '../data/characters';
import connections from '../data/connections.json';

interface ActionOutput {
    msg: string;
}

interface WorldState {
    inSiege: number | null,
    initialLocation: number,
    plagueLocation: number,
    turnNo: number,
    doubleMovement: boolean,
    msg?: string
}

interface ActionSnapshot {
    action: GameAction;
    world: WorldState;
}

/*
api:
    pushAction(action): GameSnapshot
    popAction(): GameSnapshot
    getTurnActions(): GameAction[]

model:
    WorldState
        inSiege
        initialLocation
        doubleMovement
        plagueLocation
 */

const formatter = new class Formatter {
    affectedString(affected: Character[]) {
        if (affected.length > 1) {
            return strings.multipleCharacterKilled({ characters: affected.map(c => c.name).join(', ') });
        }
        const char = affected[0];
        if (char.gender === 0) {
            return strings.characterWoKilled({ char: char.name });
        }
        return strings.characterMaKilled({ char: char.name });
    }

    getMsg(action: GameAction) {
        switch (action.type) {
            case 'start':
                return '';
            case 'contaminate': {
                const affected = allCharacters.filter(c => action.affected.includes(c.id));
                return this.affectedString(affected);
            }
            case 'siege-start': {
                const affected = allCharacters.filter(c => action.affected.includes(c.id));
                return affected.length
                    ? strings.siegeStartedKilled({ killed: this.affectedString(affected) })
                    : strings.siegeStarted();
            }
            case 'siege-end': {
                const affected = allCharacters.filter(c => action.affected.includes(c.id));
                return affected.length > 0
                    ? strings.siegeEndedKilled({ killed: this.affectedString(affected) })
                    : strings.siegeEndSuccessfully()
            }
            case 'movement': {
                return strings.movementToLocation({ locationNo: action.to, location: connections[action.to].name })
            }
        }
    }
}();

export class GameEngine {

    private actions: ActionSnapshot[] = [];

    lastActionSnapshot = () => this.actions[this.actions.length - 1];

    state = () => this.lastActionSnapshot().world;

    lastAction = () => this.lastActionSnapshot().action;

    pushAction(action: GameAction): WorldState {
        const last = this.lastActionSnapshot();

        switch (action.type) {
            case 'start': {
                const world: WorldState = {
                    doubleMovement: false,
                    initialLocation: action.location,
                    plagueLocation: action.location,
                    inSiege: null,
                    turnNo: 1
                };
                this.actions.push({ action, world });
                return world;
            }

            case 'contaminate': {
                const world: WorldState = {
                    ...last.world,
                    msg: formatter.getMsg(action)
                };
                this.actions.push({ action, world });
                return world;
            }

            case 'movement': {
                const world: WorldState = {
                    ...last.world,
                    plagueLocation: action.to,
                    msg: formatter.getMsg(action)
                };
                this.actions.push({ action, world });
                return world;
            }

            case 'siege-start': {
                const world: WorldState = {
                    ...last.world,
                    inSiege: last.world.plagueLocation,
                    msg: formatter.getMsg(action)
                };
                this.actions.push({ action, world });
                return world;
            }

            case 'siege-end': {
                const world: WorldState = {
                    ...last.world,
                    inSiege: null,
                    msg: formatter.getMsg(action)
                };
                this.actions.push({ action, world });
                return world;
            }

            case 'end-plague-turn':
                const world: WorldState = {
                    ...last.world,
                    inSiege: null,
                    // TODO: msg
                };
                this.actions.push({ action, world });
                return world;

            default:
                console.error('unknown action', action);
                return last.world;
        }
        // TODO: add action saving
    }

    popAction(): WorldState {
        this.actions.pop();
        return this.lastActionSnapshot().world;
    }

    getTurnActions = (type?: GameActionType) => {
        let acc: GameAction[] = [];
        let turnNo = this.state().turnNo;
        for (let i = this.actions.length - 1; i >= 0; i++) {
            if (turnNo === this.actions[i].world.turnNo) {
                acc.unshift(this.actions[i].action);
            } else {
                break;
            }
        }
        if (type) {
            return acc.filter(a => a.type === type);
        }
        return acc;
    }
}
