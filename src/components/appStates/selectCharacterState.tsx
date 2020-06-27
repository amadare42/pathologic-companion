import React from 'react';
import { Character } from '../../data/characters';
import { UiProps } from '../hud/uiScreen';
import { strings } from '../locale/strings';
import Button from '../hud/button/button';
import { RouteProps, BaseAppState, SimpleTransition } from './appState';
import { SelectCharacterModalController } from '../hud/modal/selectCharacter/controller';
import { delay } from '../../utils';
import { timings } from '../hud/modal/selectCharacter/timings';

interface State {
    characters: Character[];
}

interface Props {
    onCharactersSelected: (character: Character[]) => void;
    turnNo: number;
    emptyOk: boolean;
    stateText: string;
}

export class SelectCharacterState extends BaseAppState<State> {

    private modalController: SelectCharacterModalController;

    constructor(routeProps: RouteProps, private props: Props) {
        super(routeProps, {
            characters: []
        });
        this.modalController = new SelectCharacterModalController(this.charChanged);
    }

    charChanged = (characters: Character[]) => this.setState({ characters });

    renderProps = (): UiProps => {
        const { characters } = this.state;
        return {
            mainMsg: strings.turnNo({ turn: this.props.turnNo }) + ' - ' + strings.phase({ phase: 2 }),
            msg: `${this.props.stateText}: ${strings.selectCharacter()}`,
            modalController: this.modalController,
            bottomButtons: () => {
                return <Button iconHref={ 'icons/checkmark.png' }
                               isVisible={ this.props.emptyOk || !!characters.length }
                               onClick={ () => this.closeModal(characters) } tooltip={ {
                    id: 't-contaminate',
                    direction: 'top',
                    tooltipHint: strings.contaminate()
                } }/>;
            },
            onMapBottomButtons: () => <Button iconHref={ 'icons/cross.png' } onClick={ this.onClose } tooltip={{
                id: 't-close',
                direction: 'left',
                tooltipHint: strings.close()
            }}/>
        }
    };

    private onClose = () => {
        this.modalController.contaminate([]);
        this.routeProps.popState(
            new SimpleTransition({ modalController: this.modalController }, delay(timings.birdsFlyOff * 1000))
        )
    };

    private closeModal = (characters: Character[]) => {
        this.modalController.contaminate(characters);
        this.routeProps.popState(new SimpleTransition(
            {
                modalController: this.modalController
            },
            delay((timings.birdsFlyOff + (characters.length ? timings.destructionTotal : 0)) * 1000))
        );
        if (characters.length || this.props.emptyOk) {
            this.props.onCharactersSelected(characters);
        }
        this.routeProps.update();
    }
}
