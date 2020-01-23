import { ModalController, ModalProps, RelativeSizes } from './modalController';
import CharacterCard from './selectCharacter/characterCard';
import React from 'react';
import { Character } from '../../../data/characters';
import ModalOverlay from './modalOverlay';
import { timings } from './selectCharacter/timings';

export class KilledCharactersModalController implements ModalController {
    relativeSizes = {
        w: 85,
        h: 32
    };

    private disposed = false;
    private props: ModalProps | null = null;

    constructor(private characters: Character[]) {
        // setTimeout(this.destructionEnd, timings.destructionTotal * 1000);
        setTimeout(this.disposeEnd, (timings.destructionTotal + 1) * 1000);
    }

    disposeEnd = () => {
        if (!this.props) {
            return;
        }
        this.disposed = true;
        this.props.update();
    };

    renderBackdrop(props: ModalProps) {
        if (this.disposed) {
            return null;
        }

        const { sizes, pageSizes } = props;
        return <CharacterCard allSelectedCharacters={ this.characters }
                              selectedCharacter={ this.characters[0] }
                              sizes={ sizes }
                              pageSizes={ pageSizes }
                              position={ {
                                  x: 0,
                                  y: 0,
                                  height: 10,
                                  width: 10
                              } }
                              mode={ 'killed-and-hidden' }/>
    }

    renderModal(props: ModalProps) {
        if (this.disposed) {
            return null;
        }
        return <ModalOverlay pageSizes={ props.pageSizes } mode={ 'killed-and-hidden' }/>
    }

    setProps(props: ModalProps): void {
        this.props = props;
    }

}
