import BackgroundAnimation from '../crowsAnimation';
import React from 'react';
import { ModalController, ModalProps } from '../modalController';
import PlayerEffectModalContent, { PlayerEffectItem } from './playerEffectModalContent';

export class PlayerEffectModalController implements ModalController {

    relativeSizes = {
        w: 85,
        h: 55
    };

    props: ModalProps | null = null;
    activeEffects: string[] = [];

    constructor(private onItemChanged: (item: PlayerEffectItem) => void) {
    }


    setProps = (props: ModalProps) => this.props = props;

    renderModal = (props: ModalProps) => {
        const { sizes, pageSizes } = props;

        let modalSizes = {
            bottom: sizes.bottom,
            height: sizes.height,
            left: sizes.left,
            width: sizes.width
        };
        return <PlayerEffectModalContent isVisible={ true }
                                         pageSizes={ pageSizes }
                                         modalSizes={ modalSizes }
                                         itemSelected={ this.onItemChanged }
                                         selectedEffects={ this.activeEffects }/>;
    };

    renderBackdrop = (props: ModalProps) => {
        const { sizes, pageSizes } = props;

        return <>
            <BackgroundAnimation isVisible={ true } rect={ {
                x: sizes.left,
                y: sizes.pixiTop,
                width: sizes.width,
                height: sizes.height
            } } pageSizes={ pageSizes }/>
        </>
    };
}
