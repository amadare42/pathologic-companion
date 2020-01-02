import React, { Component } from 'react';
import UiScreen, { UiProps } from '../hud/uiScreen';
import { strings } from '../locale/strings';
import { AreaKey, steppe } from '../../data/areas';
import { areaToLocation, locationToAreaKey, locationToAreaKeys } from '../../utils';
import connections from '../../data/connections.json';
import { AreaFill, AreaFills, AreaToken, MapSnapshot } from '../../model';
import Button from '../hud/button/button';
import { SelectCharacterState } from './selectCharacterState';
import { Character } from '../../data/characters';
import { UiAppStateProps } from './stateRouter';

interface PlagueAction<Descriptor extends PlagueActionDescriptor = PlagueActionDescriptor> {
    descriptor: Descriptor;
    snapshot: GameState;
    msg: string;
}

type MovementsAction = {
    type: 'movement',
    to: number
};
type PlagueActionDescriptor = MovementsAction | {
    type: 'siege-start'
} | {
    type: 'siege-end',
    affected: any[]
} | {
    type: 'contaminate',
    affected: any[]
};

interface GameState {
    turnNo: number;
    doubleMovement: boolean;
    inSiege: number;
    turnActions: PlagueAction[];
}

interface Props {
    renderUi: (props: UiProps) => void;
}

interface State {
    game: GameState;
    msg: string;
    initialLocation: number;
    childState?: (() => React.ReactNode) | null;
}

class PlagueTurnState extends Component<Props, State> {

    state: State = {
        game: {
            turnNo: 1,
            turnActions: [],
            doubleMovement: false,
            inSiege: -1
        },
        initialLocation: 1,
        msg: strings.startOfTurn()
    }

    // componentDidMount(): void {
    //     this.props.setUiProps({
    //         mainMsg: strings.turnNo({ turn: this.state.game.turnNo }),
    //         mapSnapshot: this.getMapSnapshot(),
    //         undoVisible: !!this.state.game.turnActions.length,
    //         bottomButtons: this.renderButtons,
    //         msg: this.state.msg,
    //         onAreaClick: this.onAreaClick,
    //         onUndo: this.onUndo
    //     });
    // }

    // shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): boolean {
    //     if (this.state !== nextState) {
    //         this.props.setUiProps({
    //             mainMsg: strings.turnNo({ turn: this.state.game.turnNo }),
    //             mapSnapshot: this.getMapSnapshot(),
    //             undoVisible: !!this.state.game.turnActions.length,
    //             bottomButtons: this.renderButtons,
    //             msg: this.state.msg,
    //             onAreaClick: this.onAreaClick,
    //             onUndo: this.onUndo
    //         });
    //     }
    //
    //     return true;
    // }

    render() {
        if (this.state.childState) {
            return this.state.childState();
        } else {
            this.props.renderUi({
                mainMsg: strings.turnNo({ turn: this.state.game.turnNo }),
                mapSnapshot: this.getMapSnapshot(),
                undoVisible: !!this.state.game.turnActions.length,
                bottomButtons: this.renderButtons,
                msg: this.state.msg,
                onAreaClick: this.onAreaClick,
                onUndo: this.onUndo
            });
        }
        return null;
        // return <UiScreen
        //     mainMsg={strings.turnNo({ turn: this.state.game.turnNo })}
        //     msg={this.state.msg}
        //     onAreaClick={this.onAreaClick}
        //     mapSnapshot={this.getMapSnapshot()}
        //     bottomButtons={this.renderButtons}
        //     onUndo={this.onUndo}
        //     undoVisible={ !!this.state.game.turnActions.length }
        // />;
    }

    private renderButtons = () => {
        return <>
            <Button iconHref={ 'icons/contaminate_button.png' } onClick={ this.onContaminate }/>
            <Button iconHref={ 'icons/done_button.png' } onClick={ this.onTurnEnd }/>
            <Button iconHref={ 'icons/siege_button.png' } onClick={ this.onSiege }/>
        </>
    };

    private onAreaClick = (areaKey: AreaKey) => {
        const { game } = this.state;
        const location = areaToLocation(areaKey);
        const canMove = this.checkCanMove(location);
        if (!canMove) return;

        const wasInSiege = this.state.game.inSiege > -1;

        this.setState({
            game: {
                ...game,
                inSiege: -1,
                turnActions: [...game.turnActions, this.createAction({ type: 'movement', to: location })]
            },
            msg: strings.movementToLocation({ locationNo: location, location: connections[location].name })
        });
        if (wasInSiege) {
            this.pushMessage(strings.siegeCancelledCauseMovement());
        }
    };

    private onContaminate = () => {
        this.setState({
            childState: () => <SelectCharacterState mapSnapshot={ this.getMapSnapshot }
                                                    onCharacterSelected={ this.onContaminatedCharacterSelected }
                                                    renderUi={ this.props.renderUi }
                                                    popState={ this.popState }/>
        })
    };

    private popState = () => this.setState({ childState: null });

    private onContaminatedCharacterSelected = (character: Character) => {
        this.popState();
        this.pushMessage(character.name);
    };

    private onTurnEnd = () => {
        this.nextTurn();
    };

    private onSiege = () => {
        const { game } = this.state;
        const { inSiege } = game;
        const currentLocation = this.getCurrentLocation();

        if (inSiege > -1) {
            const startedThisTurn = game.turnActions.some(a => a.descriptor.type === 'siege-start');
            if (startedThisTurn) {
                this.pushMessage(strings.cannotEndSiegeOnSameTurn());
                return;
            }

            const actionsWereDone = !!game.turnActions.length;
            // shouldn't occur
            const inDifferentLocation = inSiege !== currentLocation;
            if (actionsWereDone || inDifferentLocation) {
                this.pushMessage(strings.cannotEndSiege());
                return;
            }

            this.pushMessage(strings.siegeEndSuccessfully());
            // TODO: target selection
            this.setState({
                game: {
                    ...game,
                    inSiege: -1,
                    turnActions: [...game.turnActions, this.createAction({ type: 'siege-end', affected: [] })]
                }
            });
            return;
        } else {
            const isMoved = !!this.getMovements().length;
            if (isMoved) {
                this.pushMessage(strings.cannotStartSiegeCauseMovements());
                return;
            }
            this.setState({
                game: {
                    ...game,
                    inSiege: currentLocation,
                    turnActions: [...game.turnActions, this.createAction({ type: 'siege-start' })]
                }
            })
        }
    };

    private onUndo = () => {
        const { game } = this.state;
        const action = game.turnActions[game.turnActions.length - 1];
        this.setState({
            game: action.snapshot,
            msg: action.msg
        });
    };

    private getMapSnapshot = (): MapSnapshot => {
        const snap = {
            fills: this.getAreaFills(),
            tokens: this.getTokens()
        };
        console.log({ snap });
        return snap;
    };

    private nextTurn = () => {
        const { game } = this.state;
        const currentLocation = this.getCurrentLocation();
        this.setState({
            initialLocation: currentLocation,
            game: {
                ...game,
                turnActions: [],
                turnNo: game.turnNo + 1,
            },
            msg: strings.startOfTurn()
        });
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
        const { game } = this.state;
        if (game.inSiege > -1) {
            return locationToAreaKeys(game.inSiege).map(areaKey => ({
                areaKey,
                token: 'siege'
            }));
        }
        return [];
    };

    private checkCanMove = (location: number) => {
        const { game } = this.state;
        const { doubleMovement } = game;
        const movements = this.getMovements();

        // is connected
        const currentLocation = this.getCurrentLocation();
        const isConnected = connections.find(con => con.number === currentLocation)!
            .connections.indexOf(location) >= 0;

        if (!isConnected) return false;

        // is siege
        const isSiege = game.turnActions.some(a => a.descriptor.type === 'siege-start' || a.descriptor.type === 'siege-end');
        if (isSiege) return false;

        // can move
        if (movements.length > 0) {
            if (!doubleMovement) return false;
            return movements.length < 2;
        }

        return true;
    };

    private createAction(descriptor: PlagueActionDescriptor): PlagueAction {
        return {
            descriptor,
            snapshot: this.state.game,
            msg: this.state.msg
        }
    }

    private pushMessage = (msg: string) => {
        this.setState({ msg });
    };

    private getMovements = () => this.state.game.turnActions.filter(a => a.descriptor.type === 'movement') as PlagueAction<MovementsAction>[];

    private isLocationPassed = (location: number) => {
        const movements = this.getMovements();
        const { initialLocation } = this.state;
        if (movements.length > 0) {
            return initialLocation === location || movements.some(m => m.descriptor.to === location);
        }
        return false;
    };

    private getCurrentLocation = () => {
        const { initialLocation } = this.state;
        const movements = this.getMovements();
        return movements.length ? movements[movements.length - 1].descriptor.to : initialLocation;
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

export default PlagueTurnState;
