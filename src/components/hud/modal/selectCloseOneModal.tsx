import React, { Component } from 'react';
import { createStyles, WithStyles, withStyles } from '@material-ui/styles';
import classNames from 'classnames';
import { COLORS } from '../../mapView/animationConstants';
import { Character, characters } from '../../../data/characters';
import { ReactComponent as Icon } from '../../../images/hand_white.svg';
import { calcCss } from '../../../utils/sizeCss';
import { PageSizes } from '../../theme/createTheme';

interface Props extends WithStyles<typeof styles> {
    isVisible: boolean;
    modalSizes: {
        width: number;
        height: number;
        bottom: number;
        left: number
    },
    pageSizes: PageSizes,
    onSelectedCharacterChanged: (char: Character | null) => void
}

interface State {
    pageSelected: number;
    characterSelected?: string | null;
}

class SelectCloseOneModal extends Component<Props, State> {

    state: State = {
        pageSelected: 0,
        characterSelected: null
    };

    constructor(props: any) {
        super(props);

        characters.forEach(char => {
            const img = document.createElement('img');
            img.src = `cards/${ char.id }.jpg`;
        });
    }

    render() {
        const { classes, modalSizes } = this.props;
        const { pageSelected, characterSelected } = this.state;


        return <div>
            { this.renderOverlay() }
            <div
                className={ classNames(classes.wrapper, {
                    [classes.visible]: this.props.isVisible,
                    [classes.invisible]: !this.props.isVisible,
                }) }
                style={ {
                    left: modalSizes.left,
                    bottom: modalSizes.bottom,
                    width: modalSizes.width,
                    height: modalSizes.height
                } }>

                <div className={ classes.titleRow }>
                    { characterSelected ? characters.find(c => c.id === this.state.characterSelected)!.name : '' }
                </div>

                <div className={ classes.cardSelectionRow }>
                    { this.renderCardsRow(pageSelected) }
                </div>

                { this.renderSliderIndicatorsRowsContainer() }

            </div>
        </div>
    }

    renderOverlay = () => {
        const { classes, pageSizes, isVisible } = this.props;

        return <div className={ classes.overlay } style={ {
            top: pageSizes.top,
            width: '100%',
            height: '100%',
            display: isVisible ? 'block' : 'none'
        } }/>;
    };

    renderSliderIndicatorsRowsContainer = () => {
        const { classes, modalSizes } = this.props;
        const { pageSelected } = this.state;
        const s = ~~calcCss(this.props.modalSizes, 3.5, 'vh');
        const padding = modalSizes.width / 3;

        return <div className={ classes.sliderIndicatorRow }
                    style={ { width: modalSizes.width - padding * 2, paddingLeft: padding, paddingRight: padding } }>
            { COLORS.charTints.map((_, i) => this.renderSliderIndicator(i === pageSelected, i, s)) }
        </div>
    };

    renderSliderIndicator = (isActive: boolean, idx: number, size: number) => {
        const { classes } = this.props;
        return <SliderIndicator key={ idx } className={ classNames(classes.sliderIndicator, { 'active': isActive }) }
                                color={ COLORS.charTints[idx] } size={ size }
                                onClick={ () => this.onSliderClick(idx) }/>
    };

    onSliderClick = (pageNo: number) => {
        this.setState({
            characterSelected: null,
            pageSelected: pageNo
        });
        this.props.onSelectedCharacterChanged(null);
    }

    renderCardsRow = (closeTo: number) => {
        const chars = characters.filter(c => c.closeFor === closeTo);
        return chars.map(this.renderCard);
    };

    renderCard = (char: Character) => {
        const { classes } = this.props;
        return <div key={ char.id }>
            <img className={ classNames(classes.card, `c${ char.closeFor }`, {
                active: char.id === this.state.characterSelected,
            }) } onClick={ () => this.onCardClick(char) } src={ `cards/${ char.id }.jpg` }/>
        </div>
    };

    onCardClick = (char: Character) => {
        this.props.onSelectedCharacterChanged(char);
        this.setState({ characterSelected: char.id });
    }
}

const SliderIndicator = (props: { className: string, color: string, size: number, onClick: () => void }) => {
    return <Icon className={ props.className } color={ props.color }
                 viewBox={ '0 0 340 340' }
                 onClick={ props.onClick }
                 height={ props.size } width={ props.size }/>;
};

const styles = createStyles({
    '@keyframes appear': {
        from: { opacity: 0 },
        to: { opacity: 1 }
    },
    '@keyframes disappear': {
        from: { opacity: 1 },
        to: { opacity: 0 }
    },
    wrapper: {
        position: 'absolute',
        background: 'black',
    },
    visible: {
        animationName: '$appear',
        animationDuration: '0.3s',
        animationDelay: '0.7s',
        animationFillMode: 'forwards',
        opacity: 0
    },
    invisible: {
        opacity: 0,
        pointerEvents: 'none',
        animationName: '$disappear',
        animationDuration: '0.4s',
    },

    titleRow: {
        paddingLeft: '1vw',
        paddingRight: '1vw',
        minHeight: '5vh',
        width: '100%',
        color: '#ffffff',
        fontSize: '3.8vh',
        textAlign: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
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
    sliderIndicator: {
        height: '3.5vh',
        width: '3.5vh',
        transition: '0.3s linear all',
        '&.active': {
            transform: 'scale(1.5)',
            'filter': 'brightness(300%)'
        }
    },

    overlay: {
        position: 'absolute',
        opacity: 0,
        animationName: '$appear',
        animationDuration: '0.3s',
        animationDelay: '0.7s',
        animationFillMode: 'forwards',
        background: 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)'
    }
});

export default withStyles(styles)(SelectCloseOneModal);
