import React, { Component } from 'react';
import { withStyles, WithStyles } from '@material-ui/styles';
import { styles } from './mixedMediaModal.styles';
import { PageSizes } from '../../theme/createTheme';
import { SIZES } from '../../mapView/constants';
import { calcCss } from '../../../utils/sizeCss';
import { ModalController, ModalProps, RelativeSizes } from './modalController';

export interface ModalRenderer {
    renderPixiBackdrop: () => React.ReactNode;
    renderModal: () => React.ReactNode;
}

interface Props extends WithStyles<typeof styles> {
    controller?: ModalController | null;
    pageSizes: PageSizes;
    children: (modalState: ModalRenderer) => React.ReactNode;
}

function calculateSizes(pageSizes: PageSizes, relativeSizes: RelativeSizes) {
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

class MixedMediaModal extends Component<Props> {

    render() {
        if (!this.props.controller) {
            return this.props.children({
                renderModal: () => null,
                renderPixiBackdrop: () => null
            });
        }
        const sizes = calculateSizes(this.props.pageSizes, this.props.controller.relativeSizes);
        const modalProps: ModalProps = {
            sizes,
            pageSizes: this.props.pageSizes,
            update: () => this.forceUpdate()
        };
        this.props.controller.setProps(modalProps);
        return this.props.children({
            renderModal: () => this.props.controller?.renderModal(modalProps),
            renderPixiBackdrop: () => this.props.controller?.renderBackdrop(modalProps),
        })
    }
}

export default withStyles(styles)(
    MixedMediaModal
);
