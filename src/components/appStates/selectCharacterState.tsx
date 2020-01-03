import React from 'react';
import { Character } from '../../data/characters';
import { UiProps } from '../hud/uiScreen';
import { strings } from '../locale/strings';
import Button from '../hud/button/button';
import { RouteProps, BaseAppState } from './appState';
import { SelectCharacterModalController } from '../hud/modal/selectCharacter/controller';
import { delay } from '../../utils';
import { timings } from '../hud/modal/selectCharacter/timings';

interface State {
    character: Character | null;
    inTransition: boolean;
}

interface Props {
    onCharacterSelected: (character: Character) => void;
}

export class SelectCharacterState extends BaseAppState<State> {

    private modalController: SelectCharacterModalController;

    constructor(routeProps: RouteProps, private props: Props) {
        super(routeProps, {
            character: null,
            inTransition: false
        });
        this.modalController = new SelectCharacterModalController(this.charChanged);
    }

    charChanged = (character: Character | null) => this.setState({ character });

    renderProps = (): UiProps => {
        const { character, inTransition } = this.state;
        if (inTransition) {
            return {
                modalController: this.modalController
            };
        }
        return {
            msg: strings.selectCharacter(),
            undoVisible: true,
            modalController: this.modalController,
            bottomButtons: () => {
                return <Button iconHref={ 'icons/contaminate_button.png' } isVisible={ !!character }
                               onClick={ () => this.modalController.contaminate(character) }/>;
            },
            onUndo: () => {
                this.modalController.contaminate(null);
                delay(1200)
                    .then(() => this.routeProps.popState());
                this.setState({
                    inTransition: true
                })
            }
        }
    }
}
