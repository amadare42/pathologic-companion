import React, { Component } from 'react';
import PlagueTurnState from './plagueTurnState';
import UiScreen, { UiProps } from '../hud/uiScreen';
import { areaKeys } from '../../data/areas';
import { AreaFill, AreaFills } from '../../model';

interface Props {

}

type AppState = (props: UiAppStateProps) => React.ReactNode;

interface State {
    appStates: AppState[];
    uiProps: UiProps;
}

export interface UiAppStateProps {
    isActive: boolean;
    setUiProps: (props: UiProps) => void;
    pushState: (appState: AppState) => void;
    popState: () => void;
}

const UiPropsContext = React.createContext<UiProps>({});

class StateRouter extends Component<Props, State> {

    state: State = {
        appStates: [],
        uiProps: {
            undoVisible: false,
            mapSnapshot: {
                tokens: [],
                fills: Object.fromEntries(areaKeys.map(key => ([key, 'disabled']))) as AreaFills
            }
        }
    };

    render() {
        return <UiRenderer>
            { (set: any) => {
                return <PlagueTurnState renderUi={set} />
            }}
        </UiRenderer>
    }
}

function deepEqual(a: any, b: any)
{
    if ((typeof a === typeof b) && (typeof a === 'function')) {
        return true;
    }
    if( (typeof a == 'object' && a != null) &&
        (typeof b == 'object' && b != null) )
    {
        var count = [0,0];
        for( var key in a) count[0]++;
        for( var key in b) count[1]++;
        if( count[0]-count[1] != 0) {return false;}
        for( var key in a)
        {
            if(!(key in b) || !deepEqual(a[key],b[key])) {return false;}
        }
        for( var key in b)
        {
            if(!(key in a) || !deepEqual(b[key],a[key])) {return false;}
        }
        return true;
    }
    else
    {
        return a === b;
    }
}

function UiRenderer(props: any) {
    const [uip, setUip] = React.useState<UiProps>({});
    function trySet(p: UiProps) {
        if (deepEqual(uip, p)) {
            return;
        } else {
            // console.log(p, uip);
        }
        setUip(p);
    }

    return <>
        { props.children(trySet) }
        <UiScreen {...uip} />
    </>
}

export default StateRouter;
