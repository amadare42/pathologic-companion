import { UiProps } from '../hud/uiScreen';
import { strings } from '../locale/strings';
import { AreaKey, steppe } from '../../data/areas';
import { areaToLocation, locationToAreaKey, locationToAreaKeys } from '../../utils';
import connections from '../../data/connections.json';
import { AreaFill, AreaFills, AreaToken, MapSnapshot } from '../../model';
import Button from '../hud/button/button';
import { Character } from '../../data/characters';
import { BaseAppState, RouteProps } from './appState';
import React from 'react';
import { SelectCharacterState } from './selectCharacterState';
import { ConfirmEndOfTurnState } from './confirmEndOfTurnState';
import { HealersTurnState } from './healersTurnState';
import { GameAction, MovementsAction, TurnState } from '../../model/actions';
import { GameEngine } from '../../core/gameEngine';

export interface PlagueAction<Descriptor extends GameAction = GameAction> {
    descriptor: Descriptor;
    snapshot: TurnState;
    msg: string;
}

export interface GameState {
    startingLocation: number;
    turns: TurnState[];
}

interface State {
    msg: string;
}

export class PlagueTurnState extends BaseAppState<State> {

    constructor(routeProps: RouteProps, private game: GameEngine) {
        super(routeProps, {
            msg: strings.startOfTurn()
        });
    }

    renderProps(): UiProps {
        const turn = this.game.state();
        return {
            mainMsg: strings.turnNo({ turn: turn.turnNo }) + ' - ' + this.getPhaseDescription(),
            mapSnapshot: this.getMapSnapshot(),
            bottomButtons: this.renderButtons,
            msg: this.state.msg,
            onAreaClick: this.onAreaClick,
            onMapBottomButtons: this.renderUndo,
            onMapTopButtons: () => <Button iconHref={ 'icons/double_movement.png' }
                                           isVisible={ turn.doubleMovement }
                                           tooltip={ {
                                               id: 'd-dmov',
                                               tooltipHint: strings.doubleMovement(),
                                               direction: 'left'
                                           } }/>
        }
    }

    private getPhaseDescription = () => {
        const turnActions = this.game.getTurnActions();

        if (!turnActions.length) {
            return strings.phase({ phase: 1 });
        }
        if (this.isInAdditionalMovePhase()) {
            return strings.additionalMove();
        }
        if (turnActions.some(a => a.type === 'siege-end'
            || a.type === 'contaminate'
            || a.type === 'siege-start')) {
            return strings.phase({ phase: 3 });
        }

        if (this.game.state().doubleMovement) {
            const movements = this.getMovements().length;
            if (movements === 1) {
                return strings.phase({ phase: '1-2' });
            }
        }
        return strings.phase({ phase: 2 });
    };

    private renderUndo = () => !!this.game.getTurnActions().length
        ? <Button iconHref={ 'icons/undo_button.png' } onClick={ this.onUndo } tooltip={{
            direction: 'left',
            tooltipHint: strings.cancelAction(),
            id: 't-cancel'
        }}/>
        : null;

    private renderButtons = () => {
        return <>
            <Button iconHref={ 'icons/contaminate_button.png' }
                    isActive={ !this.checkContaminate() }
                    onClick={ this.onContaminate }
                    tooltip={ {
                        id: 't-contaminate',
                        tooltipHint: strings.contaminate(),
                        direction: 'top'
                    } }/>
            <Button iconHref={ 'icons/done_button.png' }
                    onClick={ this.onTurnEnd }
                    tooltip={ {
                        id: 't-end',
                        tooltipHint: strings.finishTurn(),
                        direction: 'top'
                    } }/>
            <Button iconHref={ 'icons/siege_button.png' }
                    isActive={ !this.checkSiege() }
                    onClick={ this.onSiege }
                    tooltip={ {
                        id: 't-siege',
                        tooltipHint: this.game.state().inSiege ? strings.finishSiege() : strings.startSiege(),
                        direction: 'top'
                    } }
            />
        </>
    };

    private onAreaClick = (areaKey: AreaKey) => {
        const turn = this.game.state();
        const location = areaToLocation(areaKey);
        const canMove = this.checkCanMove(location);
        if (!canMove) return;

        const wasInSiege = !!turn.inSiege;
        this.game.pushAction({
            type: 'movement',
            to: location
        });
        this.update();
        if (wasInSiege) {
            this.pushMessage(strings.siegeCancelledCauseMovement());
        }
    };

    private checkContaminate = () => {
        const turnActions = this.game.getTurnActions();
        if (turnActions.some(a => a.type === 'contaminate')) {
            return strings.cannotContaminateTwice();
        } else if (turnActions.some(a => a.type === 'siege-start' || a.type === 'siege-end')) {
            return strings.cannotContaminateCauseSiege();
        }
        return '';
    };

    private onContaminate = () => {
        const errorMsg = this.checkContaminate();
        if (errorMsg) {
            this.pushMessage(errorMsg);
            return;
        }

        this.routeProps.pushState(new SelectCharacterState(this.routeProps, {
            onCharactersSelected: this.onContaminatedCharacterSelected,
            emptyOk: false,
            turnNo: this.game.state().turnNo
        }));
    };

    private onContaminatedCharacterSelected = (characters: Character[]) => {
        this.game.pushAction({
            type: 'contaminate',
            affected: characters.map(c => c.id)
        });
        this.update();
    };

    private onTurnEnd = () => {
        this.routeProps.pushState(new ConfirmEndOfTurnState(this.routeProps, {
            mapSnapshot: this.getMapSnapshot(),
            onTurnEnd: this.onTurnEndConfirm
        }));
    };

    private onTurnEndConfirm = () => {
        this.routeProps.pushState(new HealersTurnState(this.routeProps, {
            mapSnapshot: this.getMapSnapshot(),
            currentLocation: this.getCurrentLocation(),
            game: this.game,
            onHealersTurnEnd: this.nextTurn
        }));
    };

    private checkSiege = () => {
        const turnState = this.game.state();
        const turnActions = this.game.getTurnActions();
        const { inSiege } = turnState;
        const currentLocation = this.getCurrentLocation();

        if (inSiege) {
            const startedThisTurn = turnActions.some(a => a.type === 'siege-start');
            if (startedThisTurn) {
                return strings.cannotEndSiegeOnSameTurn();
            }

            const actionsWereDone = !!turnActions.length;
            // shouldn't occur
            const inDifferentLocation = inSiege !== currentLocation;
            if (actionsWereDone || inDifferentLocation) {
                return strings.cannotEndSiege()
            }
        } else {
            const endedThisTurn = turnActions.some(a => a.type === 'siege-end');
            if (endedThisTurn) {
                return strings.cannotStartSiegeCauseSiege();
            }

            const isMoved = !!this.getMovements().length;
            if (isMoved) {
                return strings.cannotStartSiegeCauseMovements();
            }

            const didContamination = turnActions.some(a => a.type === 'contaminate');
            if (didContamination) {
                return strings.cannotStartSiegeCauseContamination();
            }
        }

        return '';
    };

    private onSiege = () => {
        const turn = this.game.state();
        const { inSiege } = turn;
        const errorMsg = this.checkSiege();
        if (errorMsg) {
            this.pushMessage(errorMsg);
            return;
        }

        if (inSiege) {
            // End siege
            this.routeProps.pushState(new SelectCharacterState(this.routeProps, {
                onCharactersSelected: this.onCharactersSieged,
                emptyOk: true,
                turnNo: turn.turnNo
            }));
        } else {
            // Start siege
            this.routeProps.pushState(new SelectCharacterState(this.routeProps, {
                onCharactersSelected: this.onSiegeStarted,
                emptyOk: true,
                turnNo: turn.turnNo
            }));
        }
    };

    private onSiegeStarted = (characters: Character[]) => {
        this.game.pushAction({
            type: 'siege-start',
            affected: characters.map(c => c.id)
        });
        this.update();
    };

    private onCharactersSieged = (characters: Character[]) => {
        this.game.pushAction({
            type: 'siege-end',
            affected: characters.map(c => c.id)
        });
        this.update();
    };

    private onUndo = () => {
        if (!this.game.getTurnActions().length) {
            return;
        }
        this.game.popAction();
        this.update();
    };

    private getMapSnapshot = (): MapSnapshot => {
        const snap = {
            fills: this.getAreaFills(),
            tokens: this.getTokens()
        };
        return snap;
    };

    private nextTurn = () => {
        this.update();
    };

    private getAreaFills = (): AreaFills => {
        const currentLocation = this.getCurrentLocation();
        const ar: Partial<AreaFills> = {};

        const setLocation = (loc: number, fill: AreaFill) => {
            if (loc === 0) {
                for (let st of steppe) {
                    ar[st] = fill;
                }
            } else {
                ar[locationToAreaKey(loc)] = fill;
            }
        };

        for (let i = 0; i <= 15; i++) {
            const isAvailable = this.checkCanMove(i);
            const isPassed = this.isLocationPassed(i);
            const isActive = i === currentLocation;

            const fill = this.getFill(isAvailable, isPassed, isActive);

            setLocation(i, fill);
        }

        return ar as AreaFills;
    };

    private getTokens = (): AreaToken[] => {
        const turn = this.game.state();
        if (turn.inSiege) {
            return locationToAreaKeys(turn.inSiege).map(areaKey => ({
                areaKey,
                token: 'siege'
            }));
        }
        return [];
    };

    private checkCanMove = (location: number) => {
        const turn = this.game.state();
        const turnActions = this.game.getTurnActions();
        const { doubleMovement } = turn;

        // is connected
        const currentLocation = this.getCurrentLocation();
        const isConnected = connections.find(con => con.number === currentLocation)!
            .connections.indexOf(location) >= 0;

        if (!isConnected) return false;

        // no actions performed this turn
        if (!turnActions.length) {
            return true;
        }

        // is additional turn
        if (this.isInAdditionalMovePhase()) return true;

        // additional turn used
        const phase2ActionIndex = turnActions.findIndex(a => a.type === 'siege-end'
            || a.type === 'contaminate'
            || a.type === 'siege-start');
        if (phase2ActionIndex > -1 && phase2ActionIndex < turnActions.length - 1) {
            return false;
        }

        // can move
        const movements = this.getMovements();
        if (movements.length > 0) {
            if (!doubleMovement) return false;
            return movements.length < 2;
        }

        return true;
    };

    private isInAdditionalMovePhase = () => {
        const lastAction = this.game.lastAction();

        // is additional turn
        if (lastAction.type === 'siege-end'
            || lastAction.type === 'contaminate'
            || lastAction.type === 'siege-start'
        ) {
            return !!lastAction.affected.length;
        }

        return false;
    };

    private pushMessage = (msg: string) => {
        this.routeProps.pushMessage(msg);
        // this.setState({ msg });
    };

    // TODO: optimize
    private getMovements = () => this.game.getTurnActions().filter(a => a.type === 'movement') as MovementsAction[];

    private isLocationPassed = (location: number) => {
        const movements = this.getMovements();
        const { initialLocation } = this.game.state();
        if (movements.length > 0) {
            return initialLocation === location || movements.some(m => m.to === location);
        }
        return false;
    };

    private getCurrentLocation = () => {
        const { initialLocation } = this.game.state();
        const movements = this.getMovements();
        return movements.length ? movements[movements.length - 1].to : initialLocation;
    };

    private getFill = (isAvailable: boolean, isPassed: boolean, isActive: boolean): AreaFill => {
        if (isActive) return 'active';
        if (isPassed) {
            if (isAvailable) return 'passed-available';
            return 'passed';
        }
        if (isAvailable) {
            return 'available';
        }
        return 'disabled';
    };
}
