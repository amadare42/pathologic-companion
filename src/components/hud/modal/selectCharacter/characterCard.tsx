import React, { Component } from 'react';
import { Character } from '../../../../data/characters';
import { PageSizes } from '../../../theme/createTheme';
import { ModalSizes } from '../mixedMediaModal';
import { DisappearingCard } from './disapperingCard';
import CharacterOverlay from './characterOverlay';
import { Rectangle } from '../../../../model';
import { ModalMode } from './controller';
import { WithResources, withResources } from '../../../mapView/loadResources';
import * as PIXI from 'pixi.js';
import { alignFactors } from './factorCalculator';
import { QuarantineCard } from './quarantineCard';

interface Props extends WithResources {
    mode: ModalMode;
    selectedCharacter: Character | null;
    allSelectedCharacters: Character[];
    pageSizes: PageSizes;
    sizes: ModalSizes;
    position?: Rectangle;
}

class CharacterCard extends Component<Props> {

    private position: Rectangle | null = null;

    constructor(props: Props) {
        super(props);
        this.position = props.position || null;
    }


    render() {
        if (this.props.mode === 'visible') {
            return <CharacterOverlay
                positionCalculated={ this.onPositionCalculated }
                pageSizes={ this.props.pageSizes }
                sizes={ this.props.sizes }
                selectedCharacter={ this.props.selectedCharacter }
            />
        }

        if (this.props.mode === 'killed-and-hidden' && this.position && this.props.allSelectedCharacters.length) {
            return this.renderCards();
        }

        return null;
    }

    renderCards = () => {
        const { allSelectedCharacters, resources, pageSizes } = this.props;
        const calculatedFactors = alignFactors(allSelectedCharacters.length, {
            width: this.props.pageSizes.viewport.width,
            height: this.props.pageSizes.middle
        }, 0.61);

        const vw = pageSizes.viewport.width;
        const vh = pageSizes.middle;

        const arr: React.ReactNode[] = [];

        for (let i = 0; i < allSelectedCharacters.length; i++) {
            const character = allSelectedCharacters[i];
            const factors = calculatedFactors[i];
            const tex = new PIXI.Texture(resources.characterCards[character.id]);
            const currentScale = this.position!.width / tex.width;
            const target = {
                x: factors.x * vw,
                y: factors.y * vh,
                scale: (factors.height * vh / tex.height)
            };
            if (character.isHealer) {
                arr.push(<QuarantineCard scale={ currentScale }
                                         tex={ tex }
                                         target={ target }
                                         position={ this.position! }
                                         key={ character.id }
                />)
            } else {
                arr.push(<DisappearingCard scale={ currentScale }
                                           tex={ tex }
                                           target={ target }
                                           position={ this.position! }
                                           key={ character.id }
                />)
            }
        }

        return arr;
    };

    onPositionCalculated = (p: Rectangle) => this.position = p;
}

export default withResources(CharacterCard);
