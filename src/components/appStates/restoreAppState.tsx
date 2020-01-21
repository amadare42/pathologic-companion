import { BaseAppState, RouteProps } from './appState';
import { UiProps } from '../hud/uiScreen';
import { PersistenceService, trackingService } from '../../core/persistenceService';
import { PlagueTurnState} from './plagueTurnState';
import { SelectStartingAreaState } from './selectStartingAreaState';
import { ActionSnapshot, GameEngine } from '../../core/gameEngine';
import { HealersTurnState } from './healersTurnState';
import { strings } from '../locale/strings';
import { urlSerializer } from '../../core/gameActionsUrlSerializer';
import { ReplayState } from './replayState';

export class RestoreAppState extends BaseAppState<{}> {

    constructor(routeProps: RouteProps, private persistenceService: PersistenceService = new PersistenceService()) {
        super(routeProps, {});
        const url = new URLSearchParams(document.location.search).get('r');
        if (url) {
            setTimeout(() => this.restoreFromUrl(url), 0);
        } else {
            trackingService.getAll().then(this.onLoaded);
        }
    }

    restoreFromUrl = (url: string) => {
        try {
            const actions = urlSerializer.deserialize(url);
            this.routeProps.popState();
            this.routeProps.pushState(new ReplayState(this.routeProps, actions));
        } catch (e) {
            // TODO: error parsing url handling
            console.log('Error parsing url', e);
            this.onLoaded(null);
        }
    };

    onLoaded = (actions: ActionSnapshot[] | null) => {
        this.routeProps.popState();
        if (!actions) {
            this.routeProps.pushState(new SelectStartingAreaState(this.routeProps));
            return;
        }
        const game = new GameEngine({
            persistenceService: this.persistenceService,
            actions
        });
        if (game.isPlagueTurn()) {
            this.routeProps.pushState(new PlagueTurnState(this.routeProps, game));
        } else {
            const pTurn = new PlagueTurnState(this.routeProps, game);
            this.routeProps.pushState(pTurn);
            this.routeProps.pushState(new HealersTurnState(this.routeProps, { game, mapSnapshot: pTurn.getMapSnapshot() }))
        }
    };

    renderProps(): UiProps {
        return {
            mainMsg: strings.restoringGameState()
        };
    }

}
