import { createStyles } from '@material-ui/styles';

export const styles = createStyles({
    button: {
        '& :hover': {
            filter: 'brightness(150%)'
        },
        width: '7vh',
        height: '7vh'
    },
    tooltip: {
        fontSize: '6vw',
        boxShadow: '10px 10px 30px 0px rgba(0,0,0,0.75)'
    }
});
