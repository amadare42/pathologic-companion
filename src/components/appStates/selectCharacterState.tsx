import React from 'react';
import { Character } from '../../data/characters';
import { UiProps } from '../hud/uiScreen';
import { strings } from '../locale/strings';
import Button from '../hud/button/button';
import { RouteProps, BaseAppState } from './appState';

interface State {
    character: Character | null;
}

interface Props {
    onCharacterSelected: (character: Character) => void;
}

export class SelectCharacterState extends BaseAppState<State> {

    constructor(routeProps: RouteProps, private props: Props) {
        super(routeProps, {
            character: null
        });
    }

    renderProps = (): UiProps => {
        const { character } = this.state;
        return {
            msg: strings.selectCharacter(),
            undoVisible: true,
            isModalVisible: true,
            onCharacterSelected: (character) => {
                this.setState({ character })
            },
            bottomButtons: () => {
                return <Button iconHref={ 'icons/contaminate_button.png' } isVisible={ !!character }
                               onClick={ () => this.props.onCharacterSelected(character!) }/>;
            },
            onUndo: () => this.stateman.popState()
        }
    }
}
