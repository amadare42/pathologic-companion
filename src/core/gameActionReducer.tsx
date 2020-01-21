import { GameAction } from '../model/actions';
import { ActionSnapshot, formatter, WorldState } from './gameEngine';
import _ from 'lodash';

export const gameActionReducer = (actions: ActionSnapshot[], action: GameAction, last: ActionSnapshot): ActionSnapshot[] => {
    switch (action.type) {
        case 'start': {
            const world: WorldState = {
                doubleMovement: false,
                initialLocation: action.location,
                plagueLocation: action.location,
                inSiege: null,
                statusMsg: formatter.getStatusMsg(action),
                turnNo: 1
            };
            return [...actions, { action, world }];
        }

        case 'contaminate': {
            const world: WorldState = {
                ...last.world,
                inSiege: null,
                statusMsg: formatter.getStatusMsg(action)
            };
            return [...actions, { action, world }];
        }

        case 'movement': {
            const world: WorldState = {
                ...last.world,
                inSiege: null,
                plagueLocation: action.to,
                statusMsg: formatter.getStatusMsg(action)
            };
            return [...actions, { action, world }];
        }

        case 'siege-start': {
            const world: WorldState = {
                ...last.world,
                inSiege: last.world.plagueLocation,
                statusMsg: formatter.getStatusMsg(action)
            };
            return [...actions, { action, world }];
        }

        case 'siege-end': {
            const world: WorldState = {
                ...last.world,
                inSiege: null,
                statusMsg: formatter.getStatusMsg(action)
            };
            return [...actions, { action, world }];
        }

        case 'end-plague-turn':
            const world: WorldState = {
                ...last.world,
                statusMsg: formatter.getStatusMsg(action)
            };
            return [...actions, { action, world }];

        case 'healers-m12': {
            const world: WorldState = {
                ...last.world,
                doubleMovement: action.active
            };
            const lastSnap = _.last(actions);
            if (lastSnap && lastSnap.action.type === action.type) {
                const penultimateSnap = _.nth(actions, -2);
                if (penultimateSnap && penultimateSnap.world.doubleMovement === action.active) {
                    return actions.slice(0, -1);
                }
                return [...actions.slice(0, -1), { action, world }];
            }
            return [...actions, { action, world }];
        }

        case 'healers-s-plus-movement': {
            const world: WorldState = {
                ...last.world,
                plagueLocation: action.to,
                inSiege: action.to === last.world.plagueLocation ? last.world.inSiege : null
            };
            return [...actions, { action, world }];
        }

        case 'end-healers-turn': {
            const world: WorldState = {
                ...last.world,
                initialLocation: last.world.plagueLocation,
                turnNo: last.world.turnNo + 1,
                statusMsg: formatter.getStatusMsg(action)
            };
            return [...actions, { action, world }];
        }

        default:
            console.error('unknown action', action);
            return actions;
    }
}
