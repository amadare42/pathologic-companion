import { AreaFill, Point, Rectangle } from './model';
import { AreaKey, steppe } from './data/areas';
import connections from './data/connections.json';

const fastMemoize = require('fast-memoize');

function memoize<T extends (...args: any[]) => any>(fn: T): T {
    return fastMemoize(fn) as any;
}

export const getRectangle = memoize((points: Point[]): Rectangle => {
    let minX = NaN, minY = NaN, maxX = NaN, maxY = NaN;

    for (let { x, y } of points) {
        if (isNaN(minX) || x < minX) {
            minX = x;
        }
        if (isNaN(maxX) || x > maxX) {
            maxX = x;
        }
        if (isNaN(minY) || y < minY) {
            minY = y;
        }
        if (isNaN(maxY) || y > maxY) {
            maxY = y;
        }
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
});

export const zero = (): Point => ({ x: 0, y: 0 });

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export type RefPresentation = 'raw' | 'url' | 'idSelector';

const presentWrap = (value: string, presentation: RefPresentation) => {
    switch (presentation) {
        case 'idSelector': return '#' + value;
        case 'url': return 'url(#' + value + ')';
        default: return value;
    }
};

function present<Arg = string>(fn: (key: Arg) => string) {
    return (key: Arg, p: RefPresentation = 'raw') => presentWrap(fn(key), p)
}
function presentVal(val: string) {
    return (p: RefPresentation = 'raw') => presentWrap(val, p)
}

export const refs = {
    fillId: present<AreaFill>(key => `fill-${key}`),
    maskId: present(key => `mask_${key}`),
    rootSvg: presentVal('rootSvg'),
    areaPolygon: present<AreaKey>(key => key),
    borderId: present<AreaKey>(key => `borders_${key}`),
    vectorBordersId: presentVal(`vector_borders`),

    //paths
    maskPath: present<AreaKey>(key => `areas/mask/${key}.png`)
};

export const getConnectedAreas = (areaKey: AreaKey) => {
    const areaNumber = areaNameToNumber(areaKey);
    return numberToConnectedAreas(areaNumber);
};

export const areaNameToNumber = (areaKey: AreaKey) => {
    if (steppe.indexOf(areaKey) >= 0) return 0;
    return parseInt(areaKey.slice(-2));
};

export const numberToConnectedAreas = (index: number) => {
    const entry = connections.find(con => con.number === index);
    if (!entry) return [];
    return entry.connections.map(i => numberToPolygonNames(i)).flat();
};

export const numberToPolygonNames = (index: number): AreaKey[] => {
    if (index === 0) {
        return steppe as AreaKey[];
    }
    return [locationToAreaKey(index)];
};

export const resolveOnCb = (cb: any) => new Promise(r => cb ? cb(r) : r());

export const pointsEq = (point1: Point, point2: Point) => point1.x === point2.x && point1.y === point2.y;

export const locationToAreaKey = (index: number): AreaKey => {
    if (index === 0) {
        return steppe[0];
    }
    return `area${index.toString().padStart(2, '0')}` as AreaKey;
};
export type Depromisify<T> = T extends Promise<infer D> ? D : T;
