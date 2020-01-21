import { PlagueAction } from '../components/appStates/plagueTurnState';

export type StartAction = {
    type: 'start',
    location: number
}

export type MovementsAction = {
    type: 'movement',
    to: number
};

export type ContaminationAction = {
    type: 'contaminate',
    affected: string[]
}

export type SiegeStartAction = {
    type: 'siege-start',
    affected: string[]
}

export type SiegeEndAction = {
    type: 'siege-end',
    affected: string[]
}

export type PlagueTurnEndAction = {
    type: 'end-plague-turn'
}

export type HealersMission12 = {
    type: 'healers-m12',
    active: boolean
}

export type HealersBonusMovementStam = {
    type: 'healers-s-plus-movement',
    to: number
}

export type HealersTurnEndAction = {
    type: 'end-healers-turn'
}

export type ControlActions = StartAction
    | PlagueTurnEndAction
    | HealersTurnEndAction;

export type PlagueActions = MovementsAction |
    ContaminationAction |
    SiegeStartAction |
    SiegeEndAction;

export type HealersActions = HealersMission12 | HealersBonusMovementStam;

export type GameAction = ControlActions | PlagueActions | HealersActions;

export type GameActionType = GameAction['type'];

export type GameActionData<Type extends GameAction> = Omit<Type, 'type'>;

export interface TurnState {
    turnNo: number;
    doubleMovement: boolean;
    initialLocation: number;
    inSiege: number;
    turnActions: PlagueAction[];
}

export const controlActionTypes: GameActionType[] = ['start', 'end-plague-turn', 'end-healers-turn'];
