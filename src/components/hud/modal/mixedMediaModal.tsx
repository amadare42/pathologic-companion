import React, { Component } from 'react';
import { withStyles, WithStyles } from '@material-ui/styles';
import { styles } from './mixedMediaModal.styles';
import { Character } from '../../../data/characters';
import ModalBackground from './modalBackground';
import { PageSizes } from '../../theme/createTheme';
import SelectCloseOneModal from './selectCloseOneModal';
import { SIZES } from '../../mapView/animationConstants';
import { calcCss } from '../../../utils/sizeCss';
import CharacterCard from './characterCard';

export interface ModalRenderer {
    renderPixiBackdrop: () => React.ReactNode;
    renderModal: () => React.ReactNode;
}

interface Props extends WithStyles<typeof styles> {
    isVisible: boolean;
    pageSizes: PageSizes;
    children: (modalState: ModalRenderer) => React.ReactNode;
    onCharacterSelected?: (character: Character | null) => void;
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

export type ModalSizes = ReturnType<typeof calculateSizes>;

interface State {
    selectedCharacter: Character | null;
    backdropShown: boolean;
}

class MixedMediaModal extends Component<Props, State> {

    state: State = {
        selectedCharacter: null,
        backdropShown: false
    };

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        // invisible -> visible
        if (this.props.isVisible && !prevProps.isVisible) {
            this.setState({
                backdropShown: true,
                selectedCharacter: null
            })
        }

        // visible -> invisible
        if (!this.props.isVisible && prevProps.isVisible) {
            this.setState({
                selectedCharacter: null
            });
        }
    }

    render() {
        const sizes = calculateSizes(this.props.pageSizes);
        return this.props.children({
            renderModal: this.renderModal(sizes),
            renderPixiBackdrop: this.renderBackdrop(sizes)
        })
    }

    renderModal = (sizes: ModalSizes) => () => {
        return <SelectCloseOneModal modalSizes={ {
            bottom: sizes.bottom,
            height: sizes.height,
            left: sizes.left,
            width: sizes.width
        } } pageSizes={ this.props.pageSizes } isVisible={ this.props.isVisible }
                                    onSelectedCharacterChanged={ this.onCharacterChanged }/>;
    };

    onCharacterChanged = (char: Character | null) => {
        this.setState({ selectedCharacter: char });
        if (this.props.onCharacterSelected) {
            this.props.onCharacterSelected(char);
        }
    };

    renderBackdrop = (sizes: ModalSizes) => () => {
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

    renderCharacterOverlay = (sizes: ModalSizes) => {
        return <CharacterCard selectedCharacter={this.state.selectedCharacter}
                              sizes={sizes}
                              pageSizes={this.props.pageSizes}
                              onAnimationsDone={() => this.setState({ backdropShown: false })}
                              isVisible={this.props.isVisible} />;
    }
}

export default withStyles(styles)(
    MixedMediaModal
);
