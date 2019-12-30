import React from 'react';
import { withStyles, WithStyles } from '@material-ui/styles';
import { styles } from './topPanel/topPanel.styles';
import TopPanel from './topPanel/topPanel';
import BottomPanel from './bottomPanel/bottomPanel';
import Layout from './layout';
import MapView from '../mapView/mapView';
import PixieStage from '../stage/PixieStage';
import { PageSizes, Theme } from '../theme/createTheme';
import { AreaKey, steppe } from '../../data/areas';
import { areaToLocation, locationToAreaKey, locationToAreaKeys } from '../../utils';
import connections from '../../data/connections.json';
import { AreaFill, AreaFills, AreaToken, AreaTransition, MapSnapshot } from '../../model';
import { strings } from '../locale/strings';
import MixedMediaModal, { ModalRenderer } from './modal/mixedMediaModal';

interface Props extends WithStyles<typeof styles> {
}

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

interface State {
    game: GameState;
    initialLocation: number;
    transition?: AreaTransition;
    isModalVisible: boolean;

    msg: string;
}

class PlagueTurn extends React.Component<Props, State> {

    state: State = {
        game: {
            turnNo: 1,
            turnActions: [],
            doubleMovement: false,
            inSiege: -1
        },
        initialLocation: 1,
        isModalVisible: false,
        msg: strings.startOfTurn()
    };

    constructor(props: Props) {
        super(props);

        setTimeout(() => this.setState({isModalVisible: !this.state.isModalVisible}), 1000);
    }

    render = () => {
        return <Layout>
            { (theme) => {
                return <MixedMediaModal pageSizes={ theme.pageSizes } isVisible={ this.state.isModalVisible }>
                    {
                        (modal) => (<>
                            { this.renderTopPanel() }
                            { this.renderStage(theme, modal) }
                            { modal.renderModal() }
                            { this.renderBottomPanel(theme.pageSizes) }
                        </>)
                    }
                </MixedMediaModal>
            } }
        </Layout>
    };

    private renderTopPanel = () => <TopPanel turn={ this.state.game.turnNo } text={ this.state.msg }/>;

    private renderStage = ({ pageSizes }: Theme, modalRenderer: ModalRenderer) => {
        const middleSize = {
            width: pageSizes.viewport.width,
            height: pageSizes.middle
        };

        return <PixieStage size={ middleSize } pageSizes={ pageSizes } qualityPreset={ 'med' }>
            <MapView size={ middleSize }
                     mapSnapshot={ this.getMapSnapshot() }
                     onAreaClick={ this.onAreaClick }/>
            { modalRenderer.renderPixiBackdrop() }
        </PixieStage>
    };

    private renderBottomPanel = (pageSizes: PageSizes) => <BottomPanel pageSizes={ pageSizes }
                                                                       onContaminate={ this.onContaminate }
                                                                       onEndTurn={ this.onTurnEnd }
                                                                       onSiege={ this.onSiege }
                                                                       onUndo={ this.onUndo }
                                                                       undoVisible={ !!this.state.game.turnActions.length }
    />;

    private onContaminate = () => {

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

    private createAction(descriptor: PlagueActionDescriptor): PlagueAction {
        return {
            descriptor,
            snapshot: this.state.game,
            msg: this.state.msg
        }
    }

    private onUndo = () => {
        const { game } = this.state;
        const action = game.turnActions[game.turnActions.length - 1];
        this.setState({
            game: action.snapshot,
            msg: action.msg
        });
    };

    private pushMessage = (msg: string) => {
        this.setState({ msg });
    };

    private getMovements = () => this.state.game.turnActions.filter(a => a.descriptor.type === 'movement') as PlagueAction<MovementsAction>[];

    private getCurrentLocation = () => {
        const { initialLocation } = this.state;
        const movements = this.getMovements();
        return movements.length ? movements[movements.length - 1].descriptor.to : initialLocation;
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

    private getLocationInfo = (location: number) => {
        return connections[location]!;
    };

    private getMapSnapshot = (): MapSnapshot => {
        const snap = {
            fills: this.getAreaFills(),
            transition: this.state.transition,
            tokens: this.getTokens()
        };
        console.log({ snap });
        return snap;
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

    private isLocationPassed = (location: number) => {
        const movements = this.getMovements();
        const { initialLocation } = this.state;
        if (movements.length > 0) {
            return initialLocation === location || movements.some(m => m.descriptor.to === location);
        }
        return false;
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

export default withStyles(styles)(PlagueTurn);
