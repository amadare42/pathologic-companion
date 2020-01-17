import { BaseAppState, RouteProps } from './appState';
import { UiProps } from '../hud/uiScreen';
import { AreaKey, areaKeys, steppe } from '../../data/areas';
import { AreaFills } from '../../model';
import { areaToLocation } from '../../utils';
import connections from '../../data/connections.json';
import { strings } from '../locale/strings';
import Button from '../hud/button/button';
import React from 'react';
import { PlagueTurnState } from './plagueTurnState';
import { GameEngine } from '../../core/gameEngine';

interface State {
    selectedArea: AreaKey | null;
}

export class SelectStartingAreaState extends BaseAppState<State> {

    constructor(routeProps: RouteProps, private game: GameEngine = new GameEngine()) {
        super(routeProps, {
            selectedArea: null
        });
    }

    renderProps(): UiProps {
        return {
            msg: this.getMsg(),
            mainMsg: strings.startOfGame(),
            mapSnapshot: {
                fills: this.getFills(),
                tokens: []
            },
            onAreaClick: (area) => {
                this.setState({ selectedArea: area });
            },
            bottomButtons: () => <>
                <Button iconHref={ 'icons/checkmark.png' } onClick={ this.onSelected }
                        isVisible={ !!this.state.selectedArea } tooltip={ {
                    id: 't-start',
                    tooltipHint: strings.startOfGame(),
                    direction: 'top'
                } }/>
            </>
        }
    }

    onSelected = () => {
        this.routeProps.popState();
        this.game.pushAction({ type: 'start', location: areaToLocation(this.state.selectedArea!) });
        this.routeProps.pushState(new PlagueTurnState(this.routeProps, this.game));
    };

    getMsg = () => {
        if (!this.state.selectedArea) {
            return strings.selectAreaToStartFrom();
        }
        const location = areaToLocation(this.state.selectedArea);
        const name = connections[location].name;
        return strings.startingLocation({ locationNo: location, location: name });
    };

    getFills = (): AreaFills => {
        const fills = Object.fromEntries(areaKeys.map(key => ([key, 'available']))) as AreaFills;
        if (!this.state.selectedArea) {
            return fills;
        }
        if (steppe.includes(this.state.selectedArea)) {
            steppe.forEach(k => fills[k] = 'active');
        } else {
            fills[this.state.selectedArea] = 'active';
        }
        return fills;
    }

}
