import React from 'react';
import { mapViewService } from '../MapViewService';
import { AreaTransition } from '../model';

interface Props {
    transition?: AreaTransition;
}

export class TransitionParticles extends React.Component<Props, {}> {

    currentIndex: number = -1;

    componentDidMount = () => {
        this.update();
    };

    componentDidUpdate(): void {
        this.update();
    }

    private update = () => {
        if (!this.props.transition) return;
        const { index, from, to } = this.props.transition;
        if (this.currentIndex === index) {
            return;
        }
        mapViewService.moveTo(from, to);

        this.currentIndex = index;
    };

    render = () => null;
}
