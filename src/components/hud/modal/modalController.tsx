import { PageSizes } from '../../theme/createTheme';
import React from 'react';
import { ModalSizes } from './mixedMediaModal';

export type RelativeSizes = { w: number, h: number };

export interface ModalProps {
    sizes: ModalSizes;
    pageSizes: PageSizes;
    update: () => void;
}

export interface ModalController {
    relativeSizes: RelativeSizes;

    setProps(props: ModalProps): void;

    renderModal(props: ModalProps): React.ReactNode;

    renderBackdrop(props: ModalProps): React.ReactNode;
}

export const NullModalController: ModalController = {
    relativeSizes: {
        w: 0,
        h: 0
    },
    renderBackdrop: () => null,
    renderModal: () => null,
    setProps: () => {}
};

