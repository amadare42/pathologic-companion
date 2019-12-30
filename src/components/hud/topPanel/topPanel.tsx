import React, { Component } from 'react';
import { WithStyles, withStyles } from '@material-ui/styles';
import { styles } from './topPanel.styles';
import Button from '../button/button';
import { strings } from '../../locale/strings';

interface Props extends WithStyles<typeof styles> {
    turn: number;
    text: string;
}

class TopPanel extends Component<Props> {
    render() {

        const { classes, turn, text } = this.props;

        return <div className={ classes.wrapper }>
            <div className={ classes.padding }>
                <div className={ classes.mainRow }>
                    <div className={ classes.title }>
                        { strings.turnNo({ turn }) }
                    </div>
                    <Button iconHref={'icons/menu_button.png'} />
                </div>
                <div className={ classes.secondaryRow }>
                    <div>{ text }</div>
                </div>
            </div>
            <div className={ classes.stylizedTransition }/>
        </div>
    }
}

export default withStyles(styles)(TopPanel);
