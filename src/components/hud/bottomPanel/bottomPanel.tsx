import React, { Component } from 'react';
import { withStyles, WithStyles } from '@material-ui/styles';
import { styles } from './bottomPanel.styles';
import Button from '../button/button';
import { PageSizes } from '../../theme/createTheme';

interface Props extends WithStyles<typeof styles> {
    buttons?: () => React.ReactNode;
    onMapButtons?: () => React.ReactNode;
    pageSizes: PageSizes;
}

class BottomPanel extends Component<Props> {
    render() {
        const { classes, buttons, onMapButtons } = this.props;
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
                { onMapButtons ? onMapButtons() : null }
            </div>
        </div>
    }
}

export default withStyles(styles)(BottomPanel);
