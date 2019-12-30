import React from 'react';
import { withStyles, WithStyles } from '@material-ui/styles';
import { styles } from './button.styles';

interface Props extends WithStyles<typeof styles> {
    iconHref: string;
    isVisible?: boolean;
    onClick?: () => void;
}

const Button = (props: Props) => {
    const isVisible = props.isVisible === undefined ? true : props.isVisible;
    return (
        <div style={{display: isVisible ? 'block' : 'none' }} className={props.classes.button} onClick={props.onClick}>
            <img src={props.iconHref} height={ '100%' } />
        </div>
    );
};

export default withStyles(styles)(Button);
