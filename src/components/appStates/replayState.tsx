import { BaseAppState, RouteProps } from './appState';
import { UiProps } from '../hud/uiScreen';
import Button from '../hud/button/button';
import React from 'react';
import { areaKeys } from '../../data/areas';
import { AreaFills, AreaToken } from '../../model';
import { locationToAreaKeys } from '../../utils';
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
import Slider, { Handle, Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import { calcCss } from '../../utils/sizeCss';
import ReactTooltip from 'react-tooltip';
import { COLORS } from '../mapView/animationConstants';

interface State {
    modal: ModalController | null;
}

const isControl = (s: ActionSnapshot) => controlActionTypes.includes(s.action.type);
const notControl = (s: ActionSnapshot) => !isControl(s);

let debugState = {
    currentAction: ''
};
inDebug((gui) => {
    const folder = gui.addFolder('replay');
    folder.add(debugState, 'currentAction').listen();
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
        const actions = this.actions.slice(0, this.index + 1);
        return _.takeRightWhile(actions, a =>
            a.action.type !== 'end-healers-turn'
        )
    };

    havePrev = () => {
        return this.index > 0;
        // return this.actions.slice(0, this.index).some(a => notControl(a) || a.action.type === 'start');
    };

    haveNext = () => {
        return this.actions.slice(this.index + 1).some(notControl);
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
    isPlaying = false;

    constructor(routeProps: RouteProps, private actions: GameAction[]) {
        super(routeProps, {
            modal: NullModalController
        });
        this.iterator = new ActionsIterator(actions);
        console.log(this.iterator.actions);
    }

    renderProps(): UiProps {
        const { world, action } = this.iterator.current();
        inDebug(() => debugState.currentAction = action.type);

        return {
            mainMsg: strings.turnNo({ turn: world.turnNo }),
            msg: world.statusMsg,
            bottomButtons: () => <>
                <Button iconHref={ 'icons/prev.png' } unpressableInnactive={ true }
                        isActive={ this.iterator.havePrev() } onClick={ this.playPrev }/>
                <Button iconHref={ 'icons/pause.png' } onClick={ this.playNext }/>
                <Button iconHref={ 'icons/next.png' } unpressableInnactive={ true }
                        isActive={ this.iterator.haveNext() } onClick={ this.playNext }/>
            </>,
            modalController: this.state.modal,
            mapSnapshot: {
                fills: this.getFills(),
                tokens: this.getTokens()
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

    renderSlider = (pageSizes: PageSizes) => {
        const margin = calcCss(pageSizes.viewport, 10, 'vw');
        const width = pageSizes.viewport.width - margin * 2;
        const scale = window.devicePixelRatio * 2;

        let marks = {} as any;

        this.iterator.actions.forEach((a, i) => {
            if (a.action.type == 'end-healers-turn') {
                marks[i] = a.world.turnNo;
            }
        });

        return <div style={ {
            position: 'absolute',
            width: width / scale,
            left: (pageSizes.viewport.width - width / scale) / 2,
            height: 50,
            bottom: pageSizes.bottom,
            zIndex: 999999999999,
            transform: `scale(${scale})`
        } }>
            <Slider min={ 0 }
                    max={ this.iterator.actions.length - 1 }
                    value={ this.iterator.index }
                    onChange={ v => {
                        this.iterator.index = v;
                        this.update();
                    } }
                    trackStyle={{
                        backgroundColor: '#811000'
                    }}
                    handleStyle={{
                        border: 'solid 2px #811000'
                    }}
                    activeDotStyle={{
                        borderColor: '#811000'
                    }}
                    marks={marks}
            />
        </div>
    };

    playNext = () => {
        this.playAction(this.iterator.moveNext());
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

    togglePlay = () => {

    }
}
