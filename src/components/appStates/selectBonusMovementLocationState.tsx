import { BaseAppState, RouteProps } from './appState';
import { UiProps } from '../hud/uiScreen';
import { AreaKey, areaKeys, steppe } from '../../data/areas';
import { AreaFills, MapSnapshot } from '../../model';
import { NullModalController } from '../hud/modal/modalController';
import React from 'react';
import Button from '../hud/button/button';
import { areaToLocation, locationToAreaKey, locationToAreaKeys } from '../../utils';
import connections from '../../data/connections.json';
import { strings } from '../locale/strings';
import { GameEngine, WorldState } from '../../core/gameEngine';

interface State {
    selectedArea: AreaKey | null;
}

export class SelectBonusMovementLocationState extends BaseAppState<State> {

    private readonly world: WorldState;

    constructor(routeProps: RouteProps, private game: GameEngine) {
        super(routeProps, {
            selectedArea: null
        });
        this.world = { ...game.state() };
    }

    renderProps(): UiProps {
        return {
            mapSnapshot: this.getMapSnapshot(),
            mainMsg: strings.additionalMove(),
            msg: this.getMsg(),
            onMapBottomButtons: () => <Button iconHref={ 'icons/undo_button.png' } onClick={ this.onUndo }/>,
            modalController: NullModalController,
            bottomButtons: () => <>
                <Button iconHref={ 'icons/checkmark.png' }
                        isActive={ !!this.state.selectedArea }
                        onClick={ this.onAreaConfirmed }/>
            </>,
            onAreaClick: this.areaSelected
        }
    }

    getMsg = () => {
        if (this.state.selectedArea) {
            const locationNo = areaToLocation(this.state.selectedArea);
            return strings.movementToLocation({ locationNo, location: connections[locationNo].name });
        } else {
            return strings.selectLocation();
        }
    };

    onUndo = () => {
        this.routeProps.popState();
    };

    private getAvailableAreas = () => {
        return [...connections[this.world.plagueLocation].connections.flatMap(locationToAreaKeys), ...locationToAreaKeys(this.world.plagueLocation)];
    };

    private getMapSnapshot = (): MapSnapshot => {

        const { selectedArea } = this.state;

        const startingAreas = locationToAreaKeys(this.world.plagueLocation);
        const fills = Object.fromEntries(areaKeys.map(k => ([k, 'disabled']))) as AreaFills;

        connections[this.world.plagueLocation].connections.forEach(l => {
            locationToAreaKeys(l).forEach(a => fills[a] = 'available')
        });

        if (selectedArea) {
            startingAreas.forEach(a => fills[a] = 'passed');
            if (steppe.includes(selectedArea)) {
                steppe.forEach(a => fills[a] = 'active');
            } else {
                fills[selectedArea] = 'active';
            }
        } else {
            startingAreas.forEach(a => fills[a] = 'active');
        }

        return {
            tokens: this.world.inSiege && !this.state.selectedArea
                ? [{ token: 'siege', areaKey: locationToAreaKey(this.world.plagueLocation) }]
                : [],
            fills
        }
    };

    private areaSelected = (area: AreaKey) => {
        if (!this.getAvailableAreas().includes(area)) {
            return;
        }
        if (this.world.inSiege) {
            this.routeProps.pushMessage(strings.cancelSiegeWarning());
        }
        this.setState({
            selectedArea: area
        })
    };

    private onAreaConfirmed = () => {
        this.routeProps.popState();
        const location = this.state.selectedArea ? areaToLocation(this.state.selectedArea) : this.world.plagueLocation;
        this.routeProps.pushMessage(strings.movementToLocation({
            locationNo: location,
            location: connections[location].name
        }));
        this.game.pushAction({
            type: 'healers-s-plus-movement',
            to: location
        });
    }
}
