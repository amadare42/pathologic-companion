import React, { Component } from 'react';
import { createStyles, WithStyles, withStyles } from '@material-ui/styles';
import classNames from 'classnames';
import { COLORS } from '../../../mapView/constants';
import { Character } from '../../../../data/characters';
import { PageSizes } from '../../../theme/createTheme';
import ReactHammer from 'react-hammerjs';
import ModalTitleRow from '../modalTitleRow';
import SliderIndicator from '../selectCharacter/sliderIndicator';
import { m12, PlayerEffectItem, sPlusMovement } from '../../../../data/healersEffects';

interface Props extends WithStyles<typeof styles> {
    modalSizes: {
        width: number;
        height: number;
        bottom: number;
        left: number
    },
    pageSizes: PageSizes,
    isVisible: boolean,
    selectedEffects: string[],
    itemSelected: (item: PlayerEffectItem) => void
}

interface State {
    pageSelected: number;
    itemSelected: number;
    selectedCharacters: Character[];
}

interface HealersPage {
    name: string;
    indicatorImage: string;
    items: PlayerEffectItem[];
}

const pages: HealersPage[] = [
    {
        name: 'Місії',
        indicatorImage: 'icons/missions.png',
        items: [{
            id: 'm-12',
            name: 'Верхом на крысах',
            image: 'cards/missions/12.jpg',
            type: 'mission'
        }]
    },
    {
        name: 'Штами',
        indicatorImage: 'icons/stamm.png',
        items: [{
            id: 's-plus-movement',
            name: 'Перемещение',
            image: 'cards/stams/bonus_movement.jpg',
            type: 'stam'
        }]
    }
];


class PlayerEffectModalContent extends Component<Props, State> {

    state: State = {
        pageSelected: 0,
        itemSelected: 0,
        selectedCharacters: []
    };

    constructor(props: Props) {
        super(props);
        props.itemSelected(pages[0].items[0]);
    }

    render() {
        const { classes, modalSizes } = this.props;

        return <div>
            { this.renderOverlay() }
            <ReactHammer onSwipe={ this.onSwipe } options={ {
                recognizers: {
                    swipe: {
                        velocity: 0.6,
                        direction: Hammer.DIRECTION_HORIZONTAL
                    }
                }
            } }>
                <div
                    className={ classNames(classes.wrapper, {
                        [classes.visible]: true
                    }) }
                    style={ {
                        left: modalSizes.left,
                        bottom: modalSizes.bottom,
                        width: modalSizes.width,
                        height: modalSizes.height
                    } }>

                    <ModalTitleRow text={ pages[this.state.pageSelected].name }/>

                    { this.renderContainer() }
                    { this.renderSliderIndicatorsRowsContainer() }
                </div>
            </ReactHammer>
        </div>
    }

    renderContainer = () => {
        const { modalSizes } = this.props;
        const { pageSelected, itemSelected } = this.state;

        const page = pages[pageSelected];
        const selectedItem = page.items[itemSelected];
        const isOngoing = this.props.selectedEffects.includes(selectedItem.id);

        return <div style={ {
            width: '95%',
            display: 'flex',
            justifyContent: 'center',
            color: 'white',
            height: modalSizes.height * 0.7,
            textAlign: 'left',
            paddingLeft: '2.5%',
            paddingRight: '2.5%',
            fontSize: '5vw'
        } }>
            { this.renderCardPreview(selectedItem.image, isOngoing) }
            { this.renderItemButtons() }
        </div>
    };

    renderCardPreview = (href: string, isOngoing: boolean) => <div
        style={ { maxWidth: 'calc(50% - 10px)', paddingRight: 9, height: '100%', display: 'inline-block' } }>
        <img draggable={ false } src={ href } style={ {
            maxWidth: '100%',
            maxHeight: '100%',
            border: isOngoing ? `0.4vh ${ COLORS.charTints[2] } solid` : `0.4vh transparent solid`,
            // boxShadow: isOngoing ? `0px 0px 30px 10px ${ COLORS.charTints[2] }` : 'unset'
        } }/>
    </div>;

    renderItemButtons = () => {
        const { pageSelected, itemSelected } = this.state;
        const page = pages[pageSelected];

        return <div onSelect={ () => false }
                    style={ { minWidth: '50%', display: 'inline-block', verticalAlign: 'top' } }>
            { page.items.map((item, i) => this.renderItemButton(item.name, this.props.selectedEffects.includes(item.id), i === itemSelected, i)) }
        </div>
    };

    renderItemButton = (text: string, isOngoing: boolean, isActive: boolean, index: number) => {
        return <div style={ {
            minHeight: '10vh',
            padding: '1vw',
            lineHeight: '10vh',
            transition: '0.2s linear all',
            background: isActive ? '#ffffff40' : '#ffffff19',
            border: isOngoing ? `0.4vh ${ COLORS.charTints[2] } solid` : `0.4vh transparent solid`,
            // boxShadow: isOngoing ? `0px 0px 3vh 1.7vh ${ COLORS.charTints[2] }` : 'unset',
            textAlign: 'center',
            userSelect: 'none',
            verticalAlign: 'bottom',
            marginBottom: '1vh'
        } } onClick={ () => this.onItemClick(index) }>
            { text }
        </div>;
    };

    renderSliderIndicatorsRowsContainer = () => {
        const { classes, modalSizes } = this.props;
        const { pageSelected } = this.state;
        const padding = modalSizes.width / 3;

        return <div className={ classes.sliderIndicatorRow }
                    style={ { width: modalSizes.width - padding * 2, paddingLeft: padding, paddingRight: padding } }>
            { pages.map((p, i) => <SliderIndicator isHealer={ false } isActive={ pageSelected === i }
                                                   onClick={ () => this.onIndicatorClick(i) }>
                <img draggable={ false } src={ p.indicatorImage } style={ { maxWidth: '100%', maxHeight: '100%' } }/>
            </SliderIndicator>) }
        </div>
    };

    private onItemClick = (index: number) => {
        this.props.itemSelected(pages[this.state.pageSelected].items[index]);
        this.setState({ itemSelected: index })
    };

    private onIndicatorClick = (index: number) => {
        this.changePage(index);
    };

    private onSwipe = (ev: HammerInput) => {
        let page = this.state.pageSelected;
        if (ev.velocityX > 0) {
            page--;
            if (page < 0) page = pages.length - 1;
        } else if (ev.velocityX < 0) {
            page++;
            if (page > pages.length - 1) page = 0;
        }
        this.changePage(page);
    };

    private changePage = (pageSelected: number) => {
        this.props.itemSelected(pages[pageSelected].items[0]);
        this.setState({ pageSelected, itemSelected: 0 });
    }

    renderOverlay = () => {
        const { classes, pageSizes } = this.props;

        return <div className={ classNames(classes.overlay) } style={ {
            top: pageSizes.top,
        } }/>;
    };
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
        zIndex: 101,
        userSelect: 'none',
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


    sliderIndicatorRow: {
        position: 'absolute',
        bottom: '1vh',
        display: 'flex',
        justifyContent: 'space-between',
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
        }
    }
});

export default withStyles(styles)(PlayerEffectModalContent);
