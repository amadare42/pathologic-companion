import { Character } from '../../../../data/characters';
import SelectCharacterModalContent from './selectCharacterModalContent';
import ModalBackground from '../modalBackground';
import CharacterCard from './characterCard';
import React from 'react';
import { ModalController, ModalProps } from '../modalController';

export type ModalMode = 'visible' | 'hidden' | 'killed-and-hidden';

export class SelectCharacterModalController implements ModalController {

    relativeSizes = {
        w: 85,
        h: 32
    };

    modalMode: ModalMode = 'visible';

    character: Character | null = null;

    props: ModalProps | null = null;

    constructor(
        private charChanged: (character: Character | null) => void
    ) { }

    setProps = (props: ModalProps) => this.props = props;

    renderModal = (props: ModalProps) => {
        const { sizes, pageSizes } = props;

        let modalSizes = {
            bottom: sizes.bottom,
            height: sizes.height,
            left: sizes.left,
            width: sizes.width
        };
        return <SelectCharacterModalContent modalSizes={ modalSizes }
                                            pageSizes={ pageSizes }
                                            mode={ this.modalMode }
                                            onSelectedCharacterChanged={ this.onCharacterChanged }/>;
    };

    renderBackdrop = (props: ModalProps) => {
        const { sizes, pageSizes } = props;

        return <>
            { this.renderCharacterOverlay(props) }
            <ModalBackground isVisible={ this.modalMode == 'visible' } rect={ {
                x: sizes.left,
                y: sizes.pixiTop,
                width: sizes.width,
                height: sizes.height
            } } pageSizes={ pageSizes }/>
        </>
    };

    renderCharacterOverlay = (props: ModalProps) => {
        const { sizes, pageSizes } = props;
        return <CharacterCard selectedCharacter={ this.character }
                              sizes={ sizes }
                              pageSizes={ pageSizes }
                              mode={ this.modalMode }/>;
    };

    onCharacterChanged = (character: Character | null) => {
        this.character = character;
        this.props?.update();
        this.charChanged(character);
    }

    contaminate = (character: Character | null) => {
        if (character) {
            this.modalMode = 'killed-and-hidden';
        } else {
            this.modalMode = 'hidden';
        }
        console.log('cont', this.props, character, this);
        this.props?.update();
    }
}
