import { createStyles } from '@material-ui/styles';

export const styles = createStyles({
    wrapper: {
        // background: '#000000',
        position: 'absolute',
        left: 200,
        top: 100,
        width: 600,
        height: 1000,
    },
    cardRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '2vw'
    },
    card: {
        width: '15vw',
        height: '24vw'
    }
});
