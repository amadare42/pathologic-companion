import React, { Component } from 'react';
import { WithStyles, withStyles } from '@material-ui/styles';
import { styles } from './topPanel.styles';
import Button from '../button/button';

interface Props extends WithStyles<typeof styles> {
    main?: string | null;
    secondary?: string | null;
}

class TopPanel extends Component<Props> {
    render() {

        const { classes, main, secondary } = this.props;

        return <div className={ classes.wrapper }>
            <div className={ classes.padding }>
                <div className={ classes.mainRow }>
                    <div className={ classes.title }>
                        { main || '' }
                    </div>
                    <Button iconHref={'icons/menu_button.png'} />
                </div>
                <div className={ classes.secondaryRow }>
                    <div>{ secondary || '' }</div>
                </div>
            </div>
            <div className={ classes.stylizedTransition }/>
        </div>
    }
}

export default withStyles(styles)(TopPanel);
