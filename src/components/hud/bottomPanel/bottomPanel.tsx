import React, { Component } from 'react';
import { withStyles, WithStyles } from '@material-ui/styles';
import { styles } from './bottomPanel.styles';
import Button from '../button/button';
import { PageSizes } from '../../theme/createTheme';

interface Props extends WithStyles<typeof styles> {
    onContaminate: () => void;
    onEndTurn: () => void;
    onSiege: () => void;
    onUndo: () => void;
    undoVisible: boolean;
    pageSizes: PageSizes;
}

class BottomPanel extends Component<Props> {
    render() {
        const { classes, pageSizes } = this.props;
        return <div className={ classes.wrapper } style={{
            bottom: 0
        }}>
            <div className={ classes.padding }>
                <div className={ classes.buttonsWrapper }>
                    <Button iconHref={'icons/contaminate_button.png'} onClick={this.props.onContaminate} />
                    <Button iconHref={'icons/done_button.png'} onClick={this.props.onEndTurn} />
                    <Button iconHref={'icons/siege_button.png'} onClick={this.props.onSiege} />
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
