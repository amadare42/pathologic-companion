import { controlActionTypes, GameAction } from '../model/actions';
import { strings } from '../components/locale/strings';
import { allCharacters, Character } from '../data/characters';
import connections from '../data/connections.json';
import _ from 'lodash';
import { PersistenceService } from './persistenceService';
import { gameActionReducer } from './gameActionReducer';

export interface WorldState {
    inSiege: number | null,
    initialLocation: number,
    plagueLocation: number,
    turnNo: number,
    doubleMovement: boolean,
    statusMsg?: string
}

export interface ActionSnapshot {
    action: GameAction;
    world: WorldState;
}

export const formatter = new class Formatter {
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

    getActionName(action: GameAction) {
        switch (action.type) {
            case 'start':
                return strings.startOfGame();
            case 'end-plague-turn':
                return strings.turnEnd();
            case 'end-healers-turn':
                return strings.turnEnd();
            case 'movement':
                return this.getStatusMsg(action);
            case 'contaminate':
                return strings.contaminate();
            case 'siege-start':
                return strings.siegeStarted();
            case 'siege-end':
                return strings.siegeEndSuccessfully();
            case 'healers-m12':
                if (action.active) {
                    return strings.activatedEffect({ effect: strings.effectm12() });
                } else {
                    return strings.canceledEffect({ effect: strings.effectm12() });
                }
            case 'healers-s-plus-movement':
                return strings.effectsPlusMovement();
        }
        return '';
    }

    getStatusMsg(action: GameAction) {
        switch (action.type) {
            case 'start':
                return strings.startOfGame();
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
            case 'movement':
            case 'healers-s-plus-movement': {
                return strings.movementToLocation({ locationNo: action.to, location: connections[action.to].name })
            }
            case 'end-plague-turn': {
                return strings.turnEnd();
            }
            case 'end-healers-turn':
                return strings.startOfTurn();
        }
    }
}();

interface Props {
    persistenceService?: PersistenceService,
    actions?: ActionSnapshot[]
}

export class GameEngine {

    private actions: ActionSnapshot[];
    private readonly persistenceService: PersistenceService;

    constructor(props?: Props) {
        (window as any).game = this;
        this.persistenceService = props?.persistenceService ?? new PersistenceService();
        this.actions = props?.actions ?? [];
    }

    lastActionSnapshot = () => _.last(this.actions)!;

    state = () => this.lastActionSnapshot().world;

    lastAction = () => this.lastActionSnapshot().action;

    pushAction(action: GameAction): WorldState {
        this.actions = gameActionReducer(this.actions, action, this.lastActionSnapshot());
        this.persistenceService.writeAll(this.actions);
        return this.lastActionSnapshot().world;
    }

    popAction() {
        const popped = this.actions.pop();
        this.persistenceService.writeAll(this.actions);
        return popped;
    }

    getTurnActions = () => {
        let acc: GameAction[] = [];
        for (let i = this.actions.length - 1; i >= 0; i--) {
            const snapshot = this.actions[i];
            if (!controlActionTypes.includes(snapshot.action.type)) {
                acc.unshift(snapshot.action);
            } else {
                break;
            }
        }
        return acc;
    }

    isPlagueTurn = () => {
        const act = _.findLast(this.actions, a => controlActionTypes.includes(a.action.type));
        if (!act) return true;
        const type = act.action.type;
        if (type === 'start' || type === 'end-healers-turn') {
            return true;
        }
        if (type === 'end-plague-turn') {
            return false;
        }

        return true;
    }
}
