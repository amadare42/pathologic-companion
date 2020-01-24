import { createStyles } from '@material-ui/styles';
import { COLORS, SIZES } from '../../mapView/constants';
import { Theme } from '../../theme/createTheme';
import { breakScaleBkg } from '../../../utils/scaleBreakdown';

export const styles = (theme: Theme) => {
    return createStyles({
        wrapper: {
            color: '#' + COLORS.activeTint.toString(16),
            backgroundColor: '#000000',
            height: theme.pageSizes.top,
            width: theme.pageSizes.viewport.width,
            position: 'absolute',
            zIndex: 100,
        },
        padding: {
            paddingTop: '1vh',
            paddingLeft: '2vw',
            paddingRight: '2vw',
            // padding: SIZES.UI.panelPaddingPx
        },
        mainRow: {
            display: 'flex',
            flexDirection: 'row',
            fontSize: '7vh',
            paddingLeft: '2vw',
            justifyContent: 'space-between'
        },
        secondaryRow: {
            fontSize: '3vh',
            textAlign: 'center',
            verticalAlign: 'middle',
            height: '6vh',
            width: '100vw',
            display: 'table-cell',
            '&.accented': {
                color: '#e7ea81'
            }
        },
        title: {
            whiteSpace: 'nowrap',
            fontSize: '40px',
        },
        stylizedTransition: {
            position: 'absolute',
            zIndex: 100,
            backgroundImage: 'url(ui/crows_legs.png)',
            ...breakScaleBkg(theme, SIZES.UI.bottomTransitionHeightPx),
            backgroundRepeat: 'repeat-x',
            width: '100%',
            pointerEvents: 'none',
            top: ~~theme.pageSizes.top - 1
        }
    });
};
