import { Theme } from '../components/theme/createTheme';
import { SIZES } from '../components/mapView/constants';

export function breakScaleBkg(theme: Theme, height: number) {
    return {
        ...scaledBackground(1, height),
        [theme.breakpoints.down('sm')]: {
            ...scaledBackground(1, height)
        },
        [theme.breakpoints.down('md')]: {
            ...scaledBackground(1, height)
        },
        [theme.breakpoints.down('xl')]: {
            ...scaledBackground(3, height)
        }
    }
}

export function scaledBackground(factor: number, height: number) {
    return {
        height: ~~(SIZES.UI.bottomTransitionHeightPx / factor),
        backgroundSize: `${ ~~(SIZES.UI.transitionElementWidthPx / factor) }px ${ ~~(height / factor) }px`,
    }
}
