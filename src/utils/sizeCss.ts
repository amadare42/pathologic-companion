import { Size } from 'react-virtualized';
import { CSSProperties } from 'react';

export const sizeCss = (size: Size, padding: number = 0): CSSProperties => {
    const paddedHeight = size.height - padding * 2;
    const width = size.width - padding * 2;

    return { height: paddedHeight, maxHeight: paddedHeight, width }
};

export const calcCss = (size: Size, part: number, side: 'vmin' | 'vmax' | 'width' | 'height' | 'vh' | 'vw') => {
    side = side == 'vh' ? 'height' : side;
    side = side == 'vw' ? 'width' : side;
    const sideValue = side === 'width' || side === 'height'
        ? size[side]
        : side === 'vmin'
            ? size.height < size.width ? size.height : size.width
            : size.height < size.width ? size.width : size.height;

    return sideValue * (part / 100);
};
