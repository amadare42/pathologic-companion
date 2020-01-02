import React, { Component } from 'react';
import { Character } from '../../data/characters';
import { MapSnapshot } from '../../model';
import UiScreen, { UiProps } from '../hud/uiScreen';
import { strings } from '../locale/strings';
import Button from '../hud/button/button';

interface Props {
    onCharacterSelected: (character: Character) => void;
    mapSnapshot: () => MapSnapshot;
    popState: () => void;
    renderUi: (props: UiProps) => void;
}

export function SelectCharacterState(props: Props) {
    let character: Character | null = null;
    void function() {
        props.renderUi({
            msg: strings.selectCharacter(),
            mapSnapshot: props.mapSnapshot(),
            onCharacterSelected: (c) => {
                character = c;
            },
            bottomButtons: () => {
                return <Button iconHref={ 'icons/contaminate_button.png' } isVisible={ !!character }
                               onClick={ () => {
                                   props.onCharacterSelected(character!)
                               } }/>;
            },
            onUndo: props.popState,
            isModalVisible: true,
            undoVisible: true
        });
    }();
    return null;
}

