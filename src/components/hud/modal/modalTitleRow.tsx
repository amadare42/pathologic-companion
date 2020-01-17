import React from 'react';
import { createStyles, withStyles, WithStyles } from '@material-ui/styles';

export interface Props extends WithStyles<typeof styles> {
    text?: string | null;
}

const ModalTitleRow = (props: Props) => {
    const { classes, text } = props;
    return <div className={ classes.titleRow }>
        { text ? text : '' }
    </div>
};

const styles = createStyles({
    titleRow: {
        paddingLeft: '1vw',
        paddingRight: '1vw',
        minHeight: '5vh',
        width: '100%',
        color: '#ffffff',
        fontSize: '3.8vh',
        textAlign: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
});

export default withStyles(styles)(ModalTitleRow);
