import { Resources, ResourcesContext, withResources } from '../../../mapView/loadResources';
import { PageSizes } from '../../../theme/createTheme';
import { Character } from '../../../../data/characters';
import React, { Component, useContext } from 'react';
import * as PIXI from 'pixi.js';
import { Sprite, Container } from '@inlet/react-pixi';
import { ModalSizes } from '../mixedMediaModal';
import { RawDisplayObj } from '../../../mapView/pixiUtils/rawDisplayObj';
import { Point, Rectangle } from '../../../../model';

interface Props {
    resources: Resources,
    sizes: ModalSizes,
    pageSizes: PageSizes,
    selectedCharacter: Character | null,
    positionCalculated: (rect: Rectangle) => void;
}

interface State {
    mode: 'none' | 'partial' | 'full';
}

class CharacterOverlay extends Component<Props> {


    render() {
        const { sizes, pageSizes, resources } = this.props;
        if (!resources || !this.props.selectedCharacter) return null;

        const baseTex = resources?.characterCards[this.props.selectedCharacter?.id];

        const scrFullHeight = (sizes.width / baseTex.width) * baseTex.height;
        const scrShift = scrFullHeight * 0.1;
        const scrShiftedHeight = scrFullHeight - scrShift;
        const scrAvailableSpace = pageSizes.middle - sizes.pixiTop;
        const scrRequiredHeight = scrAvailableSpace > scrShiftedHeight
            ? scrFullHeight
            : scrAvailableSpace;

        this.props.positionCalculated({
            x: sizes.left,
            y: -scrShift,
            width: sizes.width,
            height: scrRequiredHeight
        });

        const texHeight = (scrRequiredHeight / scrFullHeight) * baseTex.height;

        return <Container>
            <Sprite
                texture={ new PIXI.Texture(baseTex, new PIXI.Rectangle(0, 0, baseTex.width, texHeight)) }
                width={ sizes.width }
                height={ scrRequiredHeight }
                x={ sizes.left }
                y={ -scrShift }
            />
        </Container>
    }

}

export default withResources(CharacterOverlay);
