import { createStyles } from '@material-ui/styles';
import { COLORS, SIZES } from '../../mapView/constants';
import { Theme } from '../../theme/createTheme';
import { breakScaleBkg } from '../../../utils/scaleBreakdown';

export const styles = (theme: Theme) => createStyles({
    wrapper: {
        color: '#' + COLORS.activeTint.toString(16),
        backgroundColor: '#000000',
        height: theme.pageSizes.bottom,
        width: theme.pageSizes.viewport.width,
        position: 'absolute'
    },
    padding: {
        padding: SIZES.UI.panelPaddingPx
    },
    buttonsWrapper: {
        display: 'flex',
        justifyContent: 'space-around',
        paddingLeft: '10vw',
        paddingRight: '10vw'
    },
    stylizedTransition: {
        position: 'absolute',
        backgroundImage: 'url(ui/crows_wings.png)',
        ...breakScaleBkg(theme, SIZES.UI.bottomTransitionHeightPx),
        bottom: ~~theme.pageSizes.bottom - 2,
        width: '100%',
        pointerEvents: 'none'
    },
    undoContainer: {
        position: 'absolute',
        bottom: ~~(theme.pageSizes.bottom + theme.pageSizes.viewport.height * 0.04),
        right: '10vw'
    }
});
