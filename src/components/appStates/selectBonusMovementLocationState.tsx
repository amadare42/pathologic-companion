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

interface Props {
    onLocationSelected: (location: number, mapSnapshot: MapSnapshot) => void
    initialLocation: number;
    inSiege: number;
}

interface State {
    selectedArea: AreaKey | null;
}

export class SelectBonusMovementLocationState extends BaseAppState<State> {

    constructor(routeProps: RouteProps, private props: Props) {
        super(routeProps, {
            selectedArea: null
        });
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
            return 'Select blocked region';
        }
    };

    onUndo = () => {
        this.routeProps.popState();
    };

    private getAvailableAreas = () => {
        return connections[this.props.initialLocation].connections.flatMap(locationToAreaKeys);
    };

    private getMapSnapshot = (): MapSnapshot => {

        const { selectedArea } = this.state;

        const startingAreas = locationToAreaKeys(this.props.initialLocation);
        const fills = Object.fromEntries(areaKeys.map(k => ([k, 'disabled']))) as AreaFills;

        connections[this.props.initialLocation].connections.forEach(l => {
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
            tokens: this.props.inSiege > -1 && !this.state.selectedArea
                ? [{ token: 'siege', areaKey: locationToAreaKey(this.props.initialLocation) }]
                : [],
            fills
        }
    };

    private areaSelected = (area: AreaKey) => {
        if (!this.getAvailableAreas().includes(area)) {
            return;
        }
        if (this.props.inSiege > -1) {
            this.routeProps.pushMessage(strings.cancelSiegeWarning());
        }
        this.setState({
            selectedArea: area
        })
    };

    private onAreaConfirmed = () => {
        this.routeProps.popState();
        const location = this.state.selectedArea ? areaToLocation(this.state.selectedArea) : this.props.initialLocation;
        this.props.onLocationSelected(location, this.getMapSnapshot());
    }
}
