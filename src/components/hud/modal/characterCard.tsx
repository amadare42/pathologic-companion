import React, { Component } from 'react';
import { Character } from '../../../data/characters';
import { PageSizes } from '../../theme/createTheme';
import { ModalSizes } from './mixedMediaModal';
import { DisappearingCard } from './disapperingCard';
import CharacterOverlay from './characterOverlay';
import { Point, Rectangle } from '../../../model';

interface Props {
    isVisible: boolean;
    selectedCharacter: Character | null;
    pageSizes: PageSizes;
    sizes: ModalSizes;
}

interface State {
    disappearingCharacter: Character | null;
}

class CharacterCard extends Component<Props, State> {

    private position: Rectangle | null = null;

    state: State = {
        disappearingCharacter: null
    };

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.selectedCharacter && !this.props.selectedCharacter) {
            this.setState({
                disappearingCharacter: prevProps.selectedCharacter
            });
        }
    }

    render() {
        if (this.props.isVisible) {
            return <CharacterOverlay
                positionCalculated={ this.onPositionCalculated }
                pageSizes={ this.props.pageSizes }
                sizes={ this.props.sizes }
                selectedCharacter={ this.props.selectedCharacter }
            />
        }

        if (this.state.disappearingCharacter && this.position) {
            return <DisappearingCard character={ this.state.disappearingCharacter }
                                     position={ this.position }
                                     viewport={ {
                                         height: this.props.pageSizes.middle,
                                         width: this.props.pageSizes.viewport.width
                                     }}
                                     onAnimationEnd={ this.onDisappearEnd }/>
        }

        console.log('null', this);
        return null;
    }

    onPositionCalculated = (p: Rectangle) => this.position = p;

    onDisappearEnd = () => {
        this.setState({ disappearingCharacter: null });
    }
}

export default CharacterCard;
