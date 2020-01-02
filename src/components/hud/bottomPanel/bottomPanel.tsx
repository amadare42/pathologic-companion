import React, { Component } from 'react';
import { withStyles, WithStyles } from '@material-ui/styles';
import { styles } from './bottomPanel.styles';
import Button from '../button/button';
import { PageSizes } from '../../theme/createTheme';

interface Props extends WithStyles<typeof styles> {
    undoVisible: boolean;
    buttons?: () => React.ReactNode;
    pageSizes: PageSizes;
    onUndo?: () => void;
}

class BottomPanel extends Component<Props> {
    render() {
        const { classes, buttons } = this.props;
        return <div className={ classes.wrapper } style={{
            bottom: 0
        }}>
            <div className={ classes.padding }>
                <div className={ classes.buttonsWrapper }>
                    { buttons ? buttons() : null }
                </div>
            </div>
            <div className={ classes.stylizedTransition } />
            <div className={ classes.undoContainer }>
                <Button isVisible={this.props.undoVisible} iconHref={'icons/undo_button.png'} onClick={this.props.onUndo} />
            </div>
        </div>
    }
}

export default withStyles(styles)(BottomPanel);
