import React, { Component } from 'react';
import UiScreen from '../hud/uiScreen';
import { strings } from '../locale/strings';
import { AreaKey } from '../../data/areas';
import { areaToLocation } from '../../utils';
import connections from '../../data/connections.json';


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
    pushState: (stateName: string) => void;
}

interface State {
    game: GameState;
    msg: string;
    initialLocation: number;
}

class AreaSelectionState extends Component<Props, State> {

    state: State = {
        game: {
            turnNo: 1,
            turnActions: [],
            doubleMovement: false,
            inSiege: -1
        },
        initialLocation: 1,
        msg: strings.startOfTurn()
    };

    render() {
        return <UiScreen
            mainMsg={strings.turnNo({ turn: this.state.game.turnNo })}
            msg={this.state.msg}
            onAreaClick={this.onAreaClick}

        />;
    }

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

    private getCurrentLocation = () => {
        const { initialLocation } = this.state;
        const movements = this.getMovements();
        return movements.length ? movements[movements.length - 1].descriptor.to : initialLocation;
    };

}

export default AreaSelectionState;
