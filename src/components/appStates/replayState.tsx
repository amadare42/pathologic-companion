import { BaseAppState, RouteProps } from './appState';
import { UiProps } from '../hud/uiScreen';
import Button from '../hud/button/button';
import React from 'react';
import { AreaKey, areaKeys } from '../../data/areas';
import { AreaFills, AreaToken } from '../../model';
import { locationToAreaKey, locationToAreaKeys } from '../../utils';
import { strings } from '../locale/strings';
import { allCharacters } from '../../data/characters';
import { ModalController, NullModalController } from '../hud/modal/modalController';
import { KilledCharactersModalController } from '../hud/modal/killedCharactersModalController';
import { controlActionTypes, GameAction } from '../../model/actions';
import { ActionSnapshot, formatter } from '../../core/gameEngine';
import { gameActionReducer } from '../../core/gameActionReducer';
import _ from 'lodash';
import { inDebug } from '../../debug';
import { PageSizes } from '../theme/createTheme';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import { calcCss } from '../../utils/sizeCss';

interface State {
    modal: ModalController | null;
    isPlaying: boolean;
}

let debug_obj = {
    currentAction: ''
};
inDebug((gui) => {
    const folder = gui.addFolder('replay');
    folder.add(debug_obj, 'currentAction').listen();
    folder.open();
});

class ActionsIterator {
    index = 0;
    actions: ActionSnapshot[] = [];

    constructor(gameActions: GameAction[]) {
        for (let gAction of gameActions) {
            this.actions = gameActionReducer(this.actions, gAction, _.last(this.actions)!)
        }
    }

    precedingInSameTurn = () => {
        const actions = this.actions.slice(0, this.index);
        if (this.index === 0) {
            return [];
        }
        const turnNo = this.actions[this.index].world.turnNo;
        return _.takeRightWhile(actions, a =>
            a.world.turnNo === turnNo
        )
    };

    havePrev = () => {
        return this.index > 0;
    };

    haveNext = () => {
        return !!(this.actions.length && this.index < this.actions.length - 1);
    };

    current = () => {
        return this.actions[this.index];
    };

    moveNext = () => {
        if (!this.haveNext()) {
            return this.current();
        }
        return this.actions[++this.index];
    };

    movePrev = () => {
        if (!this.havePrev()) {
            return this.current();
        }
        return this.actions[--this.index];
    }
}

export class ReplayState extends BaseAppState<State> {

    iterator: ActionsIterator;
    timer: any = null;

    isPlaying = () => !!this.timer;

    constructor(routeProps: RouteProps, private actions: GameAction[]) {
        super(routeProps, {
            modal: NullModalController,
            isPlaying: false
        });
        this.iterator = new ActionsIterator(actions);
    }

    renderProps(): UiProps {
        const { world, action } = this.iterator.current();
        inDebug(() => debug_obj.currentAction = action.type);

        return {
            mainMsg: strings.turnNo({ turn: world.turnNo }),
            msg: world.statusMsg,
            bottomButtons: () => <>
                <Button iconHref={ 'icons/prev.png' } unpressableInnactive={ true }
                        isActive={ this.iterator.havePrev() } onClick={ this.playPrev }/>
                <Button iconHref={ this.isPlaying() ? 'icons/pause.png' : 'icons/play.png' } unpressableInnactive={ true } isActive={ this.iterator.haveNext() } onClick={ this.togglePlay }/>
                <Button iconHref={ 'icons/next.png' } unpressableInnactive={ true }
                        isActive={ this.iterator.haveNext() } onClick={ this.playNext }/>
            </>,
            modalController: this.state.modal,
            mapSnapshot: {
                fills: this.getFills(),
                tokens: this.getTokens(),
                focusOn: this.getFocusOnLocation()
            },
            onMapTopButtons: () => <Button iconHref={ 'icons/double_movement.png' }
                                           isVisible={ world.doubleMovement }
                                           tooltip={ {
                                               id: 'd-dmov',
                                               tooltipHint: strings.doubleMovement(),
                                               direction: 'left'
                                           } }/>,
            customComponent: this.renderSlider
        };
    }

    getFocusOnLocation = (): AreaKey => {
        const { world } = this.iterator.current();
        if (world.plagueLocation !== 0)
            return locationToAreaKey(world.plagueLocation);

        if (!this.iterator.havePrev()) {
            return 'steppe02';
        }
        const prevWorld = this.iterator.actions[this.iterator.index - 1].world;

        switch (prevWorld.plagueLocation) {
            case 1:
            case 2:
                return 'steppe01';

            case 8:
            case 14:
            case 13:
            case 6:
            case 7:
                return 'steppe03';

            default:
                return 'steppe02';
        }
    };

    renderSlider = (pageSizes: PageSizes) => {
        const margin = calcCss(pageSizes.viewport, 10, 'vw');
        const width = pageSizes.viewport.width - margin * 2;
        const scale = window.devicePixelRatio * 2;

        let marks = {} as any;

        this.iterator.actions.forEach((a, i) => {
            if (a.action.type === 'end-healers-turn') {
                marks[i] = a.world.turnNo;
            }
        });

        return <div style={ {
            position: 'absolute',
            width: width / scale,
            left: (pageSizes.viewport.width - width / scale) / 2,
            height: 50,
            bottom: pageSizes.bottom,
            zIndex: 200,
            transform: `scale(${scale})`
        } }>
            <Slider min={ 0 }
                    max={ this.iterator.actions.length - 1 }
                    value={ this.iterator.index }
                    onChange={ v => {
                        this.iterator.index = v;
                        this.playAction(this.iterator.current());
                        this.disableTimer();
                        this.update();
                    } }
                    trackStyle={{
                        backgroundColor: '#811000'
                    }}
                    handleStyle={{
                        borderColor: '#811000'
                    }}
                    activeDotStyle={{
                        borderColor: '#811000'
                    }}
                    marks={marks}
            />
        </div>
    };

    togglePlay = () => {
        if (this.isPlaying()) {
            this.disableTimer();
        } else {
            this.resetTimer();
        }
        this.update();
    };

    disableTimer = () => {
        clearInterval(this.timer);
        this.timer = null;
    };

    resetTimer = () => {
        this.disableTimer();
        this.timer = setInterval(this.timerTick, 2000);
    };

    timerTick = () => {
        this.playNext();
        if (!this.iterator.haveNext()) {
            this.disableTimer();
            this.update();
        }
    };

    playNext = () => {
        do {
            this.iterator.moveNext();
        } while (this.iterator.haveNext() && controlActionTypes.includes(this.iterator.current().action.type));
        this.playAction(this.iterator.current());
    };

    playPrev = () => this.playAction(this.iterator.movePrev());

    playAction = (snapshot: ActionSnapshot) => {
        const { action } = snapshot;

        switch (action.type) {
            case 'contaminate':
                const chars = action.affected.map(id => allCharacters.find(c => c.id === id)!);
                this.setState({
                    modal: chars.length > 0 ? new KilledCharactersModalController(chars) : NullModalController
                });
                break;

            case 'siege-start':
                const ssChars = action.affected.map(id => allCharacters.find(c => c.id === id)!);
                this.setState({
                    modal: ssChars.length > 0 ? new KilledCharactersModalController(ssChars) : NullModalController
                });
                break;

            case 'siege-end':
                const seChars = action.affected.map(id => allCharacters.find(c => c.id === id)!);
                this.setState({
                    modal: seChars.length > 0 ? new KilledCharactersModalController(seChars) : NullModalController
                });
                break;

            case 'healers-m12':
                this.setState({
                    modal: NullModalController,
                });
                break;

            default:
                this.setState({
                    modal: NullModalController,
                });
                break;
        }
        this.update();
    };

    getFills = () => {
        const fills = Object.fromEntries(areaKeys.map(key => ([key, 'available']))) as AreaFills;

        const { world } = this.iterator.current();
        const preceding = this.iterator.precedingInSameTurn();

        preceding.forEach(p => locationToAreaKeys(p.world.plagueLocation).forEach(a => fills[a] = 'passed-available'));
        locationToAreaKeys(world.initialLocation).forEach(a => fills[a] = 'passed-available');
        locationToAreaKeys(world.plagueLocation).forEach(a => fills[a] = 'active');

        return fills;
    };

    getTokens = (): AreaToken[] => {
        const { world } = this.iterator.current();

        if (world.inSiege) {
            const keys = locationToAreaKeys(world.inSiege);
            return keys.map(k => ({
                areaKey: k,
                token: 'siege'
            }));
        }
        return [];
    };

}
