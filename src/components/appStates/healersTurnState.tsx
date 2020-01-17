import { BaseAppState, RouteProps } from './appState';
import { UiProps } from '../hud/uiScreen';
import { MapSnapshot } from '../../model';
import { strings } from '../locale/strings';
import { PlayerEffectModalController } from '../hud/modal/selectPlayerEffect/playerEffectModalController';
import Button from '../hud/button/button';
import React from 'react';
import { PlayerEffectItem } from '../hud/modal/selectPlayerEffect/playerEffectModalContent';
import { SelectBonusMovementLocationState } from './selectBonusMovementLocationState';
import { PlagueAction} from './plagueTurnState';
import connections from '../../data/connections.json';
import { GameAction, TurnState } from '../../model/actions';
import { GameEngine } from '../../core/gameEngine';

interface Props {
    mapSnapshot: MapSnapshot;
    game: GameEngine;
    currentLocation: number;
    onHealersTurnEnd: () => void
}

interface Action {
    item: PlayerEffectItem;
    prevLocation: number;
    nextLocation?: number;
    mapSnapshot: MapSnapshot;
    turn: TurnState;
}

interface State {
    actions: Action[];
    mapSnapshot: MapSnapshot;
    selectedItem: PlayerEffectItem | null;
    currentLocation: number;
    turn: TurnState;
}

export class HealersTurnState extends BaseAppState<State> {

    private modal: PlayerEffectModalController;

    constructor(routeProps: RouteProps, private props: Props) {
        super(routeProps, {
            selectedItem: null,
            actions: [],
            currentLocation: props.currentLocation,
            mapSnapshot: props.mapSnapshot,
            turn: { ...props.turn }
        });
        this.modal = new PlayerEffectModalController(this.itemSelected);
    }

    renderProps(): UiProps {
        this.modal.activeEffects = this.state.turn.doubleMovement ? ['m-12'] : [];

        return {
            mainMsg: strings.healersTurn(),
            msg: strings.selectHealersEffects(),
            mapSnapshot: this.state.mapSnapshot,
            modalController: this.modal,
            bottomButtons: this.renderBottomButtons,
            onMapBottomButtons: () => <Button isVisible={ !!this.state.actions.length }
                                              iconHref={ 'icons/undo_button.png' } onClick={ this.onUndo }/>
        }
    }

    itemSelected = (item: PlayerEffectItem) => this.setState({ selectedItem: item });

    renderBottomButtons = () => {
        const { selectedItem } = this.state;
        const isDoubleMovementButton = selectedItem?.id === 'm-12';
        const isAdd = !isDoubleMovementButton || this.state.turn.doubleMovement;
        return <>
            <Button iconHref={ isAdd ? 'icons/checkmark.png' : 'icons/cross.png' }
                    isActive={ !!selectedItem }
                    tooltip={ {
                        id: 't-apply',
                        tooltipHint: isAdd ? strings.apply() : strings.disable(),
                        direction: 'top'
                    } }
                    onClick={ this.activateItem }/>
            <Button iconHref={ 'icons/done_button.png' }
                    tooltip={ {
                        id: 't-end',
                        tooltipHint: strings.finishTurn(),
                        direction: 'top'
                    } }
                    onClick={ this.onDone }/>
        </>
    };

    activateItem = () => {
        const item = this.state.selectedItem!;

        switch (item.id) {
            case 'm-12':
                this.setState({
                    actions: [...this.state.actions, {
                        item,
                        turn: { ...this.state.turn },
                        prevLocation: this.state.currentLocation,
                        mapSnapshot: this.state.mapSnapshot
                    }],
                    turn: { ...this.state.turn, doubleMovement: !this.state.turn.doubleMovement }
                });
                if (this.state.turn.doubleMovement) {
                    this.routeProps.pushMessage(strings.activatedEffect({ effect: item.name }));
                } else {
                    this.routeProps.pushMessage(strings.canceledEffect({ effect: item.name }));
                }
                return;

            case 's-plus-movement':
                this.routeProps.pushState(new SelectBonusMovementLocationState(this.routeProps, {
                    onLocationSelected: (location, mapSnapshot) => {
                        this.setState({
                            actions: [...this.state.actions, {
                                item,
                                prevLocation: this.state.currentLocation,
                                turn: { ...this.state.turn },
                                mapSnapshot: this.state.mapSnapshot,
                                nextLocation: location
                            }],
                            turn: {
                                ...this.state.turn,
                                inSiege: -1
                            },
                            mapSnapshot,
                            currentLocation: location
                        });

                        this.routeProps.pushMessage(strings.movementToLocation({
                            locationNo: location,
                            location: connections[location].name
                        }));
                    },
                    initialLocation: this.props.currentLocation,
                    inSiege: this.props.turn.inSiege
                }));
                return;
        }
    };

    onUndo = () => {
        if (!this.state.actions.length) return;

        const action = this.state.actions.splice(-1, 1)[0];
        this.setState({
            actions: [...this.state.actions],
            currentLocation: action.prevLocation,
            turn: action.turn,
            selectedItem: this.state.selectedItem,
            mapSnapshot: action.mapSnapshot
        });
        this.routeProps.pushMessage(strings.canceledEffect({ effect: action.item.name }));
    };

    onDone = () => {
        this.state.turn.turnActions.push(...this.state.actions.filter(a => a.item.id === 's-plus-movement')
            .map(a => ({
                descriptor: {
                    type: 'movement',
                    to: a.nextLocation!
                },
                snapshot: this.state.turn,
                msg: strings.movementToLocation({
                    location: connections[a.nextLocation!].name,
                    locationNo: a.nextLocation
                })
            } as PlagueAction<GameAction>)));
        this.props.onHealersTurnEnd(this.state.currentLocation, this.state.turn);
        this.routeProps.popState();
    }
}
