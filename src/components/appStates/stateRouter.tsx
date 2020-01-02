import React, { Component } from 'react';
import UiScreen, { UiProps } from '../hud/uiScreen';
import { areaKeys } from '../../data/areas';
import { AreaFills } from '../../model';
import { AppState } from './appState';
import { PlagueTurnState } from './plagueTurnState';

interface State {
    appStates: AppState[];
}

const defaultUiProps: UiProps = {
    undoVisible: false,
    mapSnapshot: {
        tokens: [],
        fills: Object.fromEntries(areaKeys.map(key => ([key, 'disabled']))) as AreaFills
    }
};

class StateRouter extends Component<{}, State> {

    state: State = {
        appStates: []
    };

    constructor(props: any) {
        super(props);

        this.state.appStates = [new PlagueTurnState(this.getRouteProps())];
    }

    getRouteProps = () => ({
        pushState: this.pushState,
        popState: this.popState,
        update: this.update
    });

    pushState = (appState: AppState) => this.setState({ appStates: [...this.state.appStates, appState] });

    popState = () => {
        this.state.appStates.splice(-1, 1);
        this.setState({ appStates: [...this.state.appStates] })
    };

    update = () => this.forceUpdate();


    render() {
        const uiProps = Object.assign({}, defaultUiProps, ...this.state.appStates.map(s => s.renderProps()));
        return <UiScreen { ...uiProps } />
    }
}

export default StateRouter;
