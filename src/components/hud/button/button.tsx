import React from 'react';
import { withStyles, WithStyles } from '@material-ui/styles';
import { styles } from './button.styles';
import ReactTooltip from 'react-tooltip';
import Holdable, { isMobile } from './holdable';

export type TooltipDirection = 'top' | 'right' | 'bottom' | 'left';

export interface Tooltip {
    tooltipHint: React.ReactNode;
    id: string;
    direction?: TooltipDirection;
}

export interface ButtonProps {
    iconHref: string;
    isVisible?: boolean;
    isActive?: boolean;
    unpressableInnactive?: boolean;
    onClick?: () => void;
    styles?: React.CSSProperties;

    tooltip?: Tooltip;
}

interface Props extends WithStyles<typeof styles>, ButtonProps {
}

class Button extends React.Component<Props> {

    divRef = React.createRef<HTMLDivElement>();

    private onClick = () => {
        ReactTooltip.hide(this.divRef.current!);
        if (this.props.tooltip && !this.props.onClick) {
            ReactTooltip.show(this.divRef.current!);
            setTimeout(() => ReactTooltip.hide(this.divRef.current!), 0);
        }
        if (this.props.onClick && (this.props.isActive || !this.props.unpressableInnactive)) {
            this.props.onClick()
        }
    };

    render() {
        const isVisible = this.props.isVisible === undefined ? true : this.props.isVisible;
        const isActive = this.props.isActive === undefined ? true : this.props.isActive;
        return (
            <>
                <Holdable onClick={ this.onClick }
                          deb={ this.props.iconHref }
                          onLongPressStart={ () => ReactTooltip.show(this.divRef.current!) }
                          onLongPressEnd={ () => ReactTooltip.hide(this.divRef.current!) }>
                    <div data-tip="" data-for={ this.props.tooltip?.id }
                         ref={ this.divRef }
                         style={
                             {...{
                                 display: isVisible ? 'block' : 'none',
                                 filter: isActive ? '' : 'grayscale(1)'
                             }, ...this.props.styles } }
                         className={ this.props.classes.button }>
                        <img alt={ this.props.iconHref } src={ this.props.iconHref }
                             style={ { WebkitTouchCallout: 'none' } } height={ '100%' }/>
                    </div>
                </Holdable>
                { this.props.tooltip ?
                    <ReactTooltip event={ 'mouseover' } eventOff={ 'mouseout' } id={ this.props.tooltip.id }
                                  effect={ 'solid' } place={ this.props.tooltip?.direction || 'left' }
                                  delayHide={ 1000 }
                                  delayShow={ isMobile ? 0 : 1000 }
                                  className={ this.props.classes.tooltip }>
                        { this.props.tooltip.tooltipHint }
                    </ReactTooltip> : null }
            </>
        );
    }
}

export default withStyles(styles)(Button);
