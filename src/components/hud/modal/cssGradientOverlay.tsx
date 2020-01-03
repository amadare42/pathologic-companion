import React, { Component } from 'react';
import { PageSizes } from '../../theme/createTheme';
import { createStyles, WithStyles, withStyles } from '@material-ui/styles';
import classNames from 'classnames';

interface Props extends WithStyles<typeof styles> {
    isVisible: boolean;
    pageSizes: PageSizes;
}

interface State {
    transitionId: number;
    isVisible: boolean;
}

class CssGradientOverlay extends Component<Props, State> {

    state: State = {
        transitionId: Date.now(),
        isVisible: false
    };

    render() {
        const { classes, pageSizes } = this.props;

        return <div className={ classNames(classes.overlay, {
            [classes.hidden]: !this.state.isVisible
        }) } style={ { top: pageSizes.top } }/>;
    }

    componentDidMount(): void {
        if (this.props.isVisible && !this.state.isVisible) {
            this.setState({
                isVisible: true
            });
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
        if (prevProps.isVisible !== this.props.isVisible) {
            if (this.props.isVisible) {
                this.setState({
                    isVisible: true,
                    transitionId: Date.now()
                })
            } else {
                const startedId = Date.now();
                setTimeout(() => {
                    if (this.state.transitionId === startedId) {
                        this.setState({
                            isVisible: false,
                        })
                    }
                }, 1900);
                this.setState({
                    transitionId: startedId
                });
            }
        }
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
    overlay: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        opacity: 0,
        animationName: '$appear',
        animationDuration: '0.3s',
        animationDelay: '0.7s',
        animationFillMode: 'forwards',
        background: 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)'
    },
    hidden: {
        opacity: 1,
        animationName: '$disappear',
        animationDuration: '0.3s',
        animationFillMode: 'forwards',
    }
});

export default withStyles(styles)(CssGradientOverlay);
