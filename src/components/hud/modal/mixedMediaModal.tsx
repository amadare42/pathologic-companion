import React, { Component, useContext } from 'react';
import { withStyles, WithStyles } from '@material-ui/styles';
import { styles } from './mixedMediaModal.styles';
import { Character, characters } from '../../../data/characters';
import ModalBackground from './modalBackground';
import { PageSizes } from '../../theme/createTheme';
import SelectCloseOneModal from './selectCloseOneModal';
import { SIZES } from '../../mapView/animationConstants';
import { calcCss } from '../../../utils/sizeCss';
import { PixiComponent, Sprite, Container } from '@inlet/react-pixi';
import { ResourcesContext, withResources } from '../../mapView/loadResources';
import * as PIXI from 'pixi.js';
import { Size } from '../../../model';
import { RawDisplayObj } from '../../mapView/pixiUtils/rawDisplayObj';

export interface ModalRenderer {
    renderPixiBackdrop: () => React.ReactNode;
    renderModal: () => React.ReactNode;
}

interface Props extends WithStyles<typeof styles> {
    isVisible: boolean;
    pageSizes: PageSizes;
    children: (modalState: ModalRenderer) => React.ReactNode;
}

const relativeSizes = {
    w: 85,
    h: 32
};

function calculateSizes(pageSizes: PageSizes) {
    const { viewport } = pageSizes;
    const undoShift = calcCss(viewport, SIZES.UI.buttonScalePc, 'height')
        + ~~(pageSizes.viewport.height * SIZES.UI.undoPaddingFactor);
    const height = calcCss(viewport, relativeSizes.h, 'vh');

    const pixiTop = pageSizes.middle - undoShift - height;
    let width = calcCss(viewport, relativeSizes.w, 'vw');
    let maxWidth = ~~(height * 1.7);
    if (width > maxWidth) {
        width = maxWidth;
    }
    return {
        height,
        width,
        left: ~~((viewport.width - width) / 2),
        pixiTop,
        bottom: pageSizes.bottom + undoShift
    }
}

type Sizes = ReturnType<typeof calculateSizes>;

interface State {
    selectedCharacter: Character | null;
}

class MixedMediaModal extends Component<Props, State> {

    state: State = {
        selectedCharacter: null
    };

    render() {
        const sizes = calculateSizes(this.props.pageSizes);
        return this.props.children({
            renderModal: this.renderModal(sizes),
            renderPixiBackdrop: this.renderBackdrop(sizes)
        })
    }

    renderModal = (sizes: Sizes) => () => {
        return <SelectCloseOneModal modalSizes={ {
            bottom: sizes.bottom,
            height: sizes.height,
            left: sizes.left,
            width: sizes.width
        } } pageSizes={ this.props.pageSizes } isVisible={ this.props.isVisible }
                                    onSelectedCharacterChanged={ (char) => this.setState({ selectedCharacter: char }) }/>;
    };

    renderBackdrop = (sizes: Sizes) => () => {
        const { isVisible, pageSizes } = this.props;

        return <>
            { this.renderCharacterOverlay(sizes) }
            <ModalBackground isVisible={ isVisible } rect={ {
                x: sizes.left,
                y: sizes.pixiTop,
                width: sizes.width,
                height: sizes.height
            } } pageSizes={ pageSizes }/>
        </>
    };

    renderCharacterOverlay = (sizes: Sizes) => {
        return <CharacterOverlay sizes={ sizes } pageSizes={this.props.pageSizes} selectedCharacter={ this.state.selectedCharacter }/>
    }
}

export function CharacterOverlay(props: { sizes: Sizes, pageSizes: PageSizes, selectedCharacter: Character | null }) {
    const resources = useContext(ResourcesContext);
    const { sizes, pageSizes } = props;
    if (!resources || !props.selectedCharacter) return null;

    const baseTex = resources?.characterCards[props.selectedCharacter?.id];

    const scrFullHeight = (sizes.width / baseTex.width) * baseTex.height;
    const scrShift = scrFullHeight * 0.1;
    const scrShiftedHeight = scrFullHeight - scrShift;
    const scrAvailableSpace = pageSizes.middle - sizes.pixiTop;
    const scrRequiredHeight = scrAvailableSpace > scrShiftedHeight
        ? scrFullHeight
        : scrAvailableSpace;

    const texHeight = (scrRequiredHeight / scrFullHeight) * baseTex.height;

    return <Sprite
        texture={ new PIXI.Texture(baseTex, new PIXI.Rectangle(0, 0, baseTex.width, texHeight)) }
        width={ sizes.width }
        height={ scrRequiredHeight }
        alpha={ 0.8 }
        x={ sizes.left }
        y={ -scrShift }
    />
}

export default withStyles(styles)(
    MixedMediaModal
);
