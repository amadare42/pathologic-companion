import { ReactComponent as Icon } from '../../../../images/hand_white.svg';
import React from 'react';
import { createStyles, WithStyles, withStyles } from '@material-ui/styles';
import classNames from 'classnames';

interface Props extends WithStyles<typeof styles> {
    isActive: boolean;
    children: React.ReactNode;
    isHealer: boolean;
    onClick: () => void;
    num?: number;
}

const SliderIndicator = (props: Props) => {
    return <div onClick={props.onClick} className={ classNames(props.classes.sliderIndicator, { active: props.isActive }) }>
        { props.children }
        { props.num
            ? <span className={ classNames(props.classes.label, { healer: props.isHealer }) }>{ props.num }</span>
            : null }
    </div>
};


const styles = createStyles({
    sliderIndicator: {
        position: 'relative',
        height: '3.5vh',
        width: '3.5vh',
        maxHeight: '3.5vh',
        maxWidth: '3.5vh',
        transition: '0.3s linear all',
        '&.active': {
            transform: 'scale(1.5)',
            'filter': 'brightness(300%)'
        }
    },
    label: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        color: 'white',
        fontWeight: 900,
        fontSize: '2vh',
        '&.healer': {
            color: 'black',
            background: '#ffffff88'
        }
    },
});

export default withStyles(styles)(SliderIndicator);
