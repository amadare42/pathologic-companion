import React, { Component } from 'react';
import { createStyles, WithStyles, withStyles } from '@material-ui/styles';
import classNames from 'classnames';
import { COLORS } from '../../../mapView/constants';
import { Character, characters, healerCharacters } from '../../../../data/characters';
import { calcCss } from '../../../../utils/sizeCss';
import { PageSizes } from '../../../theme/createTheme';
import ReactHammer from 'react-hammerjs';
import { timings } from './timings';
import { ModalMode } from './controller';
import SliderIndicator from './sliderIndicator';
import ModalTitleRow from '../modalTitleRow';
import { ReactComponent as Icon } from '../../../../images/hand.svg';

interface Props extends WithStyles<typeof styles> {
    mode: ModalMode;
    modalSizes: {
        width: number;
        height: number;
        bottom: number;
        left: number
    },
    pageSizes: PageSizes,
    onSelectedCharacterChanged: (activeCharacter: Character | null, allSelectedChars: Character[]) => void
}

interface State {
    pageSelected: number;
    selectedCharacters: Character[];
}

class SelectCharacterModalContent extends Component<Props, State> {

    state: State = {
        pageSelected: 0,
        selectedCharacters: []
    };

    getDisplayCharacter = () => {
        const { selectedCharacters, pageSelected } = this.state;
        if (!selectedCharacters.length) {
            return null;
        }
        const lastChar = selectedCharacters[selectedCharacters.length - 1];
        if (pageSelected !== lastChar.closeFor) {
            return null;
        }
        return lastChar;
    };

    render() {
        const { classes, modalSizes } = this.props;
        const { pageSelected } = this.state;
        const isVisible = this.props.mode === 'visible';

        const displayCharacter = this.getDisplayCharacter();

        return <div style={ { pointerEvents: isVisible ? 'all' : 'none' } }>
            { this.renderOverlay() }
            <ReactHammer onSwipe={ this.onSwipe }>
                <div
                    className={ classNames(classes.wrapper, {
                        [classes.visible]: isVisible
                    }) }
                    style={ {
                        left: modalSizes.left,
                        bottom: modalSizes.bottom,
                        width: modalSizes.width,
                        height: modalSizes.height
                    } }>

                    <ModalTitleRow text={ displayCharacter?.name } />

                    <div className={ classes.cardSelectionRow }>
                        { this.renderCardsRow(pageSelected) }
                    </div>

                    { this.renderSliderIndicatorsRowsContainer() }

                </div>
            </ReactHammer>
        </div>
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (this.props.mode !== 'visible' && this.state.selectedCharacters.length) {
            this.setState({ pageSelected: 0, selectedCharacters: []});
        }
    }

    private onSwipe = (ev: HammerInput) => {
        let page = this.state.pageSelected;
        if (ev.velocityX > 0) {
            page--;
            if (page < 0) page = 3;
        } else if (ev.velocityX < 0) {
            page++;
            if (page > 3) page = 0;
        }
        this.setPage(page);
    };

    renderOverlay = () => {
        const { classes, pageSizes, mode } = this.props;

        return <div className={ classNames(classes.overlay, {
            visible: mode === 'visible',
            kill: mode === 'killed-and-hidden',
            hidden: mode === 'hidden'
        }) } style={ {
            top: pageSizes.top,
        } }/>;
    };

    renderSliderIndicatorsRowsContainer = () => {
        const { classes, modalSizes } = this.props;
        const { pageSelected } = this.state;
        const s = ~~calcCss(this.props.modalSizes, 3.5, 'vh');
        const padding = modalSizes.width / 3;

        return <div className={ classes.sliderIndicatorRow }
                    style={ { width: modalSizes.width - padding * 2, paddingLeft: padding, paddingRight: padding } }>
            { COLORS.charTints.map((_, i) => this.renderSliderIndicator(i === pageSelected, i)) }
        </div>
    };

    renderSliderIndicator = (isActive: boolean, idx: number) => {

        const num = idx == 3
            ? this.state.selectedCharacters.filter(c => c.isHealer).length
            : this.state.selectedCharacters.filter(c => !c.isHealer && c.closeFor === idx).length;

        return <SliderIndicator key={ idx } isActive={ isActive }
                                isHealer={ idx == 3 }
                                num={ num }
                                onClick={ () => this.setPage(idx) }>
            <Icon color={ COLORS.charTints[idx] }
                  viewBox={ '0 0 340 340' }
                  width={ '100%' }
                  height={ '100%' } />
        </SliderIndicator>
    };

    setPage = (pageNo: number) => {
        this.setState({
            pageSelected: pageNo
        });
        this.props.onSelectedCharacterChanged(null, this.state.selectedCharacters);
    };

    renderCardsRow = (page: number) => {
        if (page === 3) {
            return healerCharacters.map(this.renderCard);
        }
        const chars = characters.filter(c => c.closeFor === page);
        return chars.map(this.renderCard);
    };

    renderCard = (char: Character) => {
        const { classes } = this.props;
        const { selectedCharacters } = this.state;
        return <div key={ char.id }>
            <img draggable={ false } alt={char.name} className={ classNames(classes.card, `c${ char.closeFor }`, {
                active: selectedCharacters.some(c => c.id === char.id),
            }) } onClick={ () => this.onCardClick(char) } src={ `cards/${ char.id }.jpg` }/>
        </div>
    };

    onCardClick = (char: Character) => {
        let selectedCharacters = this.state.selectedCharacters;
        const existingIndex = selectedCharacters.findIndex(c => c.id === char.id);
        if (existingIndex >= 0) {
            selectedCharacters.splice(existingIndex, 1);
            const newChar = selectedCharacters[selectedCharacters.length - 1] || null;
            this.props.onSelectedCharacterChanged(newChar, this.state.selectedCharacters);
        } else {
            selectedCharacters.push(char);
            this.props.onSelectedCharacterChanged(char, this.state.selectedCharacters);
        }
        this.setState({ selectedCharacters });
    }
}

const styles = createStyles({
    '@keyframes appear': {
        from: { opacity: 0 },
        to: { opacity: 1 }
    },
    '@keyframes disappear': {
        from: { opacity: 1 },
        to: { opacity: 0 }
    },
    '@keyframes disappearP': {
        from: { opacity: 0.3 },
        to: { opacity: 0 }
    },
    wrapper: {
        position: 'absolute',
        background: 'black',
        opacity: 0,
        transition: '0.3s linear all',
        pointerEvents: 'none'
    },
    visible: {
        animationName: '$appear',
        animationDuration: '0.3s',
        animationDelay: '0.7s',
        animationFillMode: 'forwards',
        opacity: 0,
        pointerEvents: 'all'
    },

    cardSelectionRow: {
        display: 'flex',
        justifyContent: 'space-around'
    },
    card: {
        height: '20vh',
        transition: '0.3s linear all',
        '&.active': {
            transform: 'scale(1.1) translateY(1vh)',
            '&.c0': {
                boxShadow: `0px 0px 30px 10px ${ COLORS.charTints[0] }`,
            },
            '&.c1': {
                boxShadow: `0px 0px 30px 10px ${ COLORS.charTints[1] }`,
            },
            '&.c2': {
                boxShadow: `0px 0px 30px 10px ${ COLORS.charTints[2] }`,
            },
            '&.c3': {
                boxShadow: `0px 0px 30px 10px ${ COLORS.charTints[3] }`,
            }
        },
    },

    sliderIndicatorRow: {
        position: 'absolute',
        bottom: '1vh',
        display: 'flex',
        justifyContent: 'space-around',
        height: '3.5vh',
        // paddingLeft: '24vh',
        // paddingRight: '24vh',
    },

    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
        animationFillMode: 'forwards',
        transition: '0.2s linear all',
        background: 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)',
        '&.visible': {
            animationName: '$appear',
            animationDelay: '0.7s',
            animationDuration: '0.3s',
        },
        '&.kill': {
            opacity: 0.3,
            animationName: '$disappearP',
            animationDelay: `${ timings.destructionTotal - 0.3 }s`,
            animationDuration: '0.3s',
        },
        '&.hidden': {
            opacity: 1,
            animationName: '$disappear',
            animationDuration: '0.3s',
        }
    }
});

export default withStyles(styles)(SelectCharacterModalContent);
