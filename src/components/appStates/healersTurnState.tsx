import { BaseAppState, RouteProps } from './appState';
import { UiProps } from '../hud/uiScreen';
import { MapSnapshot } from '../../model';
import { strings } from '../locale/strings';
import { PlayerEffectModalController } from '../hud/modal/selectPlayerEffect/playerEffectModalController';
import Button from '../hud/button/button';
import React from 'react';
import { SelectBonusMovementLocationState } from './selectBonusMovementLocationState';
import { HealersActions } from '../../model/actions';
import { formatter, GameEngine } from '../../core/gameEngine';
import { PlayerEffectItem } from '../../data/healersEffects';

interface Props {
    mapSnapshot: MapSnapshot;
    game: GameEngine;
}

interface State {
    mapSnapshot: MapSnapshot;
    selectedItem: PlayerEffectItem | null;
}

export class HealersTurnState extends BaseAppState<State> {

    private modal: PlayerEffectModalController;

    constructor(routeProps: RouteProps, private props: Props) {
        super(routeProps, {
            selectedItem: null,
            mapSnapshot: props.mapSnapshot
        });
        this.modal = new PlayerEffectModalController(this.itemSelected);
    }

    renderProps(): UiProps {
        this.modal.activeEffects = this.props.game.state().doubleMovement ? ['m-12'] : [];

        return {
            mainMsg: strings.healersTurn(),
            msg: strings.selectHealersEffects(),
            mapSnapshot: this.state.mapSnapshot,
            modalController: this.modal,
            bottomButtons: this.renderBottomButtons,
            onMapBottomButtons: () => <Button isVisible={ !!this.props.game.getTurnActions().length }
                                              tooltip={ {
                                                  direction: 'top',
                                                  tooltipHint: strings.cancelSpecificAction({ action: formatter.getActionName(this.props.game.lastAction()) }),
                                                  id: 'undo-tooltip'
                                              }}
                                              iconHref={ 'icons/undo_button.png' } onClick={ this.onUndo }/>
        }
    }

    itemSelected = (item: PlayerEffectItem) => this.setState({ selectedItem: item });

    renderBottomButtons = () => {
        const { selectedItem } = this.state;
        const isDoubleMovementButton = selectedItem?.id === 'm-12';
        const isApply = !isDoubleMovementButton || !this.props.game.state().doubleMovement;
        return <>
            <Button iconHref={ isApply ? 'icons/checkmark.png' : 'icons/cross.png' }
                    isActive={ !!selectedItem }
                    tooltip={ {
                        id: 't-apply',
                        tooltipHint: isApply ? strings.apply() : strings.disable(),
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
        const game = this.props.game;
        const gameState = game.state();

        switch (item.id) {
            case 'm-12':
                const active = !gameState.doubleMovement;
                game.pushAction({
                    type: 'healers-m12',
                    active
                });
                if (active) {
                    this.routeProps.pushMessage(strings.activatedEffect({ effect: item.name }));
                } else {
                    this.routeProps.pushMessage(strings.canceledEffect({ effect: item.name }));
                }
                this.update();
                return;

            case 's-plus-movement':
                this.routeProps.pushState(new SelectBonusMovementLocationState(this.routeProps, game));
                return;
        }
    };

    onUndo = () => {
        const { game } = this.props;
        const actions = game.getTurnActions();
        if (!actions.length) return;
        const action = game.popAction()!.action as HealersActions;
        this.routeProps.pushMessage(this.getCanceledActionStr(action));
    };

    getCanceledActionStr = (action: HealersActions) => {
        switch (action.type) {
            case 'healers-m12':
                if (action.active) {
                    return strings.canceledEffect({ effect: strings.effectm12() });
                } else {
                    return strings.effectm12();
                }
            case 'healers-s-plus-movement':
                return strings.canceledEffect({ effect: strings.effectsPlusMovement() });
        }
    };

    onDone = () => {
        this.props.game.pushAction({
            type: 'end-healers-turn'
        });
        this.routeProps.popState();
    }
}
