import { createStyles } from '@material-ui/styles';

export const styles = createStyles({
    button: {
        '& :hover': {
            filter: 'brightness(150%)'
        },
        height: '7vh'
    }
});
