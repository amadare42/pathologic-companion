import React, { Component } from 'react';
import { Character } from '../../../../data/characters';
import { PageSizes } from '../../../theme/createTheme';
import { ModalSizes } from '../mixedMediaModal';
import { DisappearingCard } from './disapperingCard';
import CharacterOverlay from './characterOverlay';
import { Rectangle } from '../../../../model';
import { ModalMode } from './controller';

interface Props {
    mode: ModalMode;
    selectedCharacter: Character | null;
    pageSizes: PageSizes;
    sizes: ModalSizes;
}

class CharacterCard extends Component<Props> {

    private position: Rectangle | null = null;

    componentDidUpdate(prevProps: Readonly<Props>, prevState: any, snapshot?: any): void {
        if (prevProps.selectedCharacter && !this.props.selectedCharacter) {
            this.setState({
                disappearingCharacter: prevProps.selectedCharacter
            });
        }
    }

    render() {
        if (this.props.mode == 'visible') {
            return <CharacterOverlay
                positionCalculated={ this.onPositionCalculated }
                pageSizes={ this.props.pageSizes }
                sizes={ this.props.sizes }
                selectedCharacter={ this.props.selectedCharacter }
            />
        }

        if (this.props.mode == 'killed-and-hidden' && this.position && this.props.selectedCharacter) {
            return <DisappearingCard character={ this.props.selectedCharacter }
                                     position={ this.position }
                                     viewport={ {
                                         height: this.props.pageSizes.middle,
                                         width: this.props.pageSizes.viewport.width
                                     }}/>
        }

        return null;
    }

    onPositionCalculated = (p: Rectangle) => this.position = p;
}

export default CharacterCard;
