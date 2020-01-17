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

export type GameAction =
    StartAction |
    MovementsAction |
    ContaminationAction |
    SiegeStartAction |
    SiegeEndAction |
    PlagueTurnEndAction;

export type GameActionType = GameAction['type'];

export type GameActionData<Type extends GameAction> = Omit<Type, 'type'>;

export interface TurnState {
    turnNo: number;
    doubleMovement: boolean;
    initialLocation: number;
    inSiege: number;
    turnActions: PlagueAction[];
}
