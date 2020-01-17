import { BaseAppState, RouteProps } from './appState';
import { UiProps } from '../hud/uiScreen';
import { ActionType, serializer } from '../../turnTracking/turnsSerializer';
import Button from '../hud/button/button';
import React from 'react';
import { areaKeys, steppe } from '../../data/areas';
import { AreaFill, AreaFills, AreaToken } from '../../model';
import { locationToAreaKey, locationToAreaKeys } from '../../utils';
import { strings } from '../locale/strings';
import connections from '../../data/connections.json';
import { allCharacters, Character, characters } from '../../data/characters';
import { ModalController, NullModalController } from '../hud/modal/modalController';
import { KilledCharactersModalController } from '../hud/modal/killedCharactersModalController';
import { GameAction, TurnState } from '../../model/actions';

export interface RecordedGame {
    turns: RecordedTurn[];
    initialLocation: number;
    serializationVer: number;
}

export interface RecordedTurn {
    turnNo: number;
    inSiege: number;
    actions: (GameAction | InitialTurnActionDescriptor)[];
}

interface State {
    location: number;
    visitedLocations: number[];
    inSiege: number;
    msg: string;
    modal: ModalController | null;
}

type RecordedTurnDescriptor = {
    type: ActionType,
    location: number,
    descriptor: GameAction
} | {
    type: 'initial',
    location: number
}

function processTurns(game: RecordedGame) {
    let turns: RecordedTurnDescriptor[] = [{
        type: 'initial',
        location: game.initialLocation
    }];

    let currentLocation = game.initialLocation;
    for (let t of game.turns) {
        turns.push({
            type:
        })
    }
}

class TurnsIterator {
    currentTurn = 0;
    currentAction = 0;

    turns: RecordedTurn[];

    constructor(game: RecordedGame) {
        this.turns = [...game.turns];
        this.turns[0].actions = [{ type: 'start', location: game.initialLocation } ,...this.turns[0].actions];
    }

    havePrev = () => {
        if (this.currentTurn > 0) return true;
        if (this.currentAction > 0) return true;
        return false;
    };

    haveNext = () => {
        if (this.turns.length > this.currentTurn + 1) return true;
        const turn = this.turns[this.currentTurn];
        if (turn.actions.length > this.currentAction + 1) return true;
        return false;
    };

    current = () => {
        return this.turns[this.currentTurn].actions[this.currentAction];
    }

    moveNext = () => {
        const turn = this.turns[this.currentTurn];
        if (!this.haveNext()) {
            return this.current();
        }
        if (turn.actions.length > this.currentAction + 1) {
            return turn.actions[++this.currentAction];
        }
        return this.turns[++this.currentTurn].actions[this.currentAction = 0];
    };

    movePrev = () => {
        const turn = this.turns[this.currentTurn];
        if (!this.havePrev()) {
            return this.current();
        }
        if (this.currentAction > 0) {
            return turn.actions[--this.currentAction];
        }
        const prevTurn = this.turns[--this.currentTurn];
        return prevTurn.actions[this.currentAction = prevTurn.actions.length - 1];
    }
}

interface InitialTurnActionDescriptor {
    type: 'start',
    location: number;
}

export class ReplayState extends BaseAppState<State> {

    iterator: TurnsIterator;
    isPlaying = false;

    constructor(routeProps: RouteProps, private game: RecordedGame) {
        super(routeProps, {
            location: game.initialLocation,
            visitedLocations: [],
            inSiege: -1,
            msg: strings.startOfGame(),
            modal: NullModalController
        });
        console.log(game);
        this.iterator = new TurnsIterator(game);
    }

    playNext = () => {
        this.playAction(this.iterator.moveNext());
    };

    playPrev = () => this.playAction(this.iterator.movePrev());

    getContaminationMsg = (characters: Character[]) => {
        if (characters.length > 1) {
            return strings.multipleCharacterKilled({ characters: characters.map(c => c.name).join(', ') });
        }

        const char = characters[0];
        if (char.gender === 0) {
            return strings.characterWoKilled({ char: char.name });
        } else {
            return strings.characterMaKilled({ char: char.name });
        }
    };

    playAction = (action: GameAction | InitialTurnActionDescriptor) => {
        switch (action.type) {
            case 'start':
                this.setState({
                    location: this.game.initialLocation,
                    inSiege: -1,
                    visitedLocations: [],
                    msg: strings.startOfGame(),
                    modal: NullModalController
                });
                return;

            case 'movement':
                this.setState({
                    location: action.to,
                    inSiege: -1,
                    visitedLocations: [...this.state.visitedLocations, this.state.location],
                    msg: strings.movementToLocation({ locationNo: action.to, location: connections[action.to].name }),
                    modal: NullModalController
                });
                return;

            case 'contaminate':
                const chars = action.affected.map(id => allCharacters.find(c => c.id === id)!);
                this.setState({
                    inSiege: -1,
                    msg: this.getContaminationMsg(chars),
                    modal: chars.length > 0 ? new KilledCharactersModalController(chars) : NullModalController
                });
                return;

            case 'siege-start':
                const ssChars = action.affected.map(id => allCharacters.find(c => c.id === id)!);
                this.setState({
                    inSiege: this.state.location,
                    msg: ssChars.length > 0
                        ? strings.siegeStartedKilled({ killed: this.getContaminationMsg(ssChars) })
                        : strings.siegeStarted()
                    ,
                    modal: ssChars.length > 0 ? new KilledCharactersModalController(ssChars) : NullModalController
                });
                return;

            case 'siege-end':
                const seChars = action.affected.map(id => allCharacters.find(c => c.id === id)!);
                this.setState({
                    inSiege: -1,
                    msg: seChars.length > 0
                        ? strings.siegeEndedKilled({ killed: this.getContaminationMsg(seChars) })
                        : strings.siegeEndSuccessfully(),
                    modal: seChars.length > 0 ? new KilledCharactersModalController(seChars) : NullModalController
                });
                return;
        }
    };

    renderProps(): UiProps {
        return {
            mainMsg: strings.turnNo({ turn: this.iterator.currentTurn + 1}),
            msg: this.state.msg,
            bottomButtons: () => <>
                <Button iconHref={'icons/prev.png'} unpressableInnactive={true} isActive={this.iterator.havePrev()} onClick={this.playPrev} />
                <Button iconHref={'icons/pause.png'} onClick={this.playNext} />
                <Button iconHref={'icons/next.png'} unpressableInnactive={true} isActive={this.iterator.haveNext()} onClick={this.playNext} />
            </>,
            modalController: this.state.modal,
            mapSnapshot: {
                fills: this.getFills(),
                tokens: this.getTokens()
            }
        };
    }

    getFills = () => {
        const fills = Object.fromEntries(areaKeys.map(key => ([key, 'available']))) as AreaFills;
        this.state.visitedLocations.forEach(l => this.setLocationFill(fills, l, 'passed-available'));
        this.setLocationFill(fills, this.state.location, 'active');

        return fills;
    };

    setLocationFill = (fills: AreaFills, location: number, fill: AreaFill) => {
        const key = locationToAreaKey(location);
        if (steppe.includes(key)) {
            steppe.forEach(k => fills[k] = fill);
        } else {
            fills[key] = fill;
        }
    }

    getTokens = (): AreaToken[] => {
        if (this.state.inSiege > -1) {
            const keys = locationToAreaKeys(this.state.inSiege);
            return keys.map(k => ({
                areaKey: k,
                token: 'siege'
            }));
        }
        return [];
    }

    togglePlay = () => {

    }
}
