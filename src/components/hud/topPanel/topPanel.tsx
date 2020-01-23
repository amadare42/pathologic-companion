import React, { Component } from 'react';
import { WithStyles, withStyles } from '@material-ui/styles';
import { styles } from './topPanel.styles';
import Button from '../button/button';
import classNames from 'classnames';
// import FitText from '@kennethormandy/react-fittext';
import FitText from '../fitText/fitText';

interface Props extends WithStyles<typeof styles> {
    main?: string | null;
    secondary?: string | null;
    msgAccented?: boolean;
    onMenuClick?: () => void;
}

class TopPanel extends Component<Props> {
    render() {

        const { classes, main, secondary, msgAccented } = this.props;

        const isAccented = msgAccented === undefined ? false : msgAccented;

        return <div className={ classes.wrapper }>
            <div className={ classes.padding }>
                <div className={ classes.mainRow }>
                    <div className={ classes.title }>
                        <FitText lines={1} maxWidth={{ value: 60, type: 'vw' }} maxHeight={{ value: 7, type: 'vh' }}>
                            { main || '' }
                        </FitText>
                    </div>
                    <Button iconHref={'icons/menu_button.png'} onClick={this.props.onMenuClick} />
                </div>
                <div className={ classNames(classes.secondaryRow, { accented: isAccented }) }>
                    <FitText lines={2} maxWidth={{ value: 100, type: 'vw' }} maxHeight={{ value: 7, type: 'vh' }}>
                        { secondary || '' }
                    </FitText>
                </div>
            </div>
            <div className={ classes.stylizedTransition }/>
        </div>
    }
}

export default withStyles(styles)(TopPanel);
