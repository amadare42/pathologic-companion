import React, { Component } from 'react';
import UiScreen, { UiProps } from '../hud/uiScreen';
import { areaKeys } from '../../data/areas';
import { AreaFills } from '../../model';
import { AppState, Transition } from './appState';
import { RestoreAppState } from './restoreAppState';
import { inDebug } from '../../debug';
import _ from 'lodash';

interface State {
    appStates: AppState[];
    transition: Transition | null;
    transientMessage: { text: string } | null;
}

const defaultUiProps: UiProps = {
    mapSnapshot: {
        tokens: [],
        fills: Object.fromEntries(areaKeys.map(key => ([key, 'disabled']))) as AreaFills
    },
    msgAccented: false
};

let debugState = {
    state: '',
    inStack: 0
};

inDebug((gui) => {
    let folder = gui.addFolder('State Router');
    folder.add(debugState, 'state').listen();
    folder.add(debugState, 'inStack').listen();
    folder.open();
});

class StateRouter extends Component<{}, State> {

    state: State = {
        appStates: [],
        transition: null,
        transientMessage: null
    };

    constructor(props: any) {
        super(props);
        this.state.appStates = [new RestoreAppState(this.getRouteProps())];

        // this.state.appStates = [new SelectStartingAreaState(this.getRouteProps())];
        // this.state.appStates = [new RestoreAppState(this.getRouteProps())];
        // this.state.appStates = [new ReplayState(this.getRouteProps(),
        //     serializer.deserialize('HY04G2B3428G4GY0Z0K'))];
        // this.state.appStates = [new HealersTurnState(this.getRouteProps(), {
        //     mapSnapshot: defaultUiProps.mapSnapshot!,
        //     activeEffects: [],
        //     currentLocation: 1
        // })];
    }

    getRouteProps = () => ({
        pushState: this.pushState,
        popState: this.popState,
        update: this.update,
        pushMessage: this.pushMsg,
        removeMsg: this.removeMsg
    });

    removeMsg = () => {
        this.setState( { transientMessage: null });
    }

    pushMsg = (msg: string, timeout: number = 3000) => {
        const transientMessage = { text: msg };
        this.setState({ transientMessage });
        setTimeout(() => {
            if (this.state.transientMessage === transientMessage) {
                this.setState({ transientMessage: null })
            }
        }, timeout);
    };

    pushState = (appState: AppState, transition: Transition | null = null) => {
        this.setState({ appStates: [...this.state.appStates, appState], transition });
        if (transition) {
            transition.promise
                .then(t => {
                    if (this.state.transition === t) {
                        this.setState({ transition: null })
                    }
                })
        }
    };

    popState = (transition?: Transition) => {
        this.state.appStates.splice(-1, 1);

        this.setState({
            appStates: [...this.state.appStates],
            transition: transition || this.state.transition
        });
        if (transition) {
            transition.promise
                .then(t => {
                    if (this.state.transition === t) {
                        this.setState({ transition: null })
                    }
                })
        }
    };

    update = () => {
        this.forceUpdate();
    };

    render() {
        inDebug(() => {
            debugState.state = _.last(this.state.appStates)?.constructor.name || '(no)';
            debugState.inStack = this.state.appStates.length;
        });

        const uiProps = Object.assign({},
            defaultUiProps,
            ...this.state.appStates.map(s => s.renderProps()),
            this.state.transition?.renderProps(),
            this.state.transientMessage
                ? { msg: this.state.transientMessage.text, msgAccented: true } as UiProps
                : null
        );
        return <UiScreen { ...uiProps } />
    }
}

export default StateRouter;
