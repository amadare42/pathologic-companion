import { BaseAppState, RouteProps } from './appState';
import { UiProps } from '../hud/uiScreen';
import { trackingService } from '../../turnTracking/turnTrackingService';
import { PlagueTurnState} from './plagueTurnState';
import { SelectStartingAreaState } from './selectStartingAreaState';
import { TurnState } from '../../model/actions';

export class RestoreAppState extends BaseAppState<{}> {

    constructor(routeProps: RouteProps) {
        super(routeProps, {});
        trackingService.getLatestTurn().then(this.onLatestTurnReceived)
    }

    onLatestTurnReceived = (turn: TurnState | null) => {
        console.log('received', turn)
        this.routeProps.popState();
        if (!turn) {
            this.routeProps.pushState(new SelectStartingAreaState(this.routeProps));
            return;
        }
        this.routeProps.pushState(new PlagueTurnState(this.routeProps, {
            turn
        }));
    };

    renderProps(): UiProps {
        return {
            mainMsg: 'Restoring prev game state'
        };
    }

}
