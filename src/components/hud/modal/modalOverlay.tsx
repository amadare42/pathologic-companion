import { createStyles, withStyles, WithStyles } from '@material-ui/styles';
import { timings } from './selectCharacter/timings';
import { PageSizes } from '../../theme/createTheme';
import classNames from 'classnames';
import React from 'react';
import { ModalMode } from './selectCharacter/controller';

interface Props extends WithStyles<typeof styles> {
    pageSizes: PageSizes;
    mode: ModalMode;
}

const ModalOverlay = (props: Props) => {
    const { classes, pageSizes, mode } = props;

    return <div className={ classNames(classes.overlay, {
        visible: mode === 'visible',
        kill: mode === 'killed-and-hidden',
        hidden: mode === 'hidden'
    }) } style={ {
        top: pageSizes.top,
    } }/>;
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
    '@keyframes disappearP': {
        from: { opacity: 0.3 },
        to: { opacity: 0 }
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

export default withStyles(styles)(ModalOverlay)
