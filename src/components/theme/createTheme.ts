import createBreakpoints from './createBreakpoints';
import { Size } from 'react-virtualized';
import { SIZES } from '../mapView/animationConstants';

export interface PageSizes {
    top: number,
    bottom: number;
    middle: number;

    viewport: Size
}

export const createThemeFromScreenSize = (size: Size) => {
    const top = ~~(SIZES.UI.buttonPanelHeightFactor * size.height) + SIZES.UI.panelPaddingPx * 2;
    const bottom = ~~(SIZES.UI.buttonPanelHeightFactor * size.height);
    const middle = size.height - top - bottom;

    const theme = createTheme({
        top, bottom, middle, viewport: size
    });
    return theme;
}

export const createTheme = (pageSizes: PageSizes) => {
    return {
        breakpoints: createBreakpoints({
            values: {
                xs: 0,
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200,
            },
        }),
        pageSizes
    }
};

export type Theme = ReturnType<typeof createTheme>;
