import { AreaKey } from '../data/areas';

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export type Polygon = Point[];

export interface Particle {
    href: string,
    x: number,
    y: number,
    angle: number,
}

export interface AreaTransition {
    from: AreaKey;
    to: AreaKey;
    index: number;
}

export interface BBox extends Point, Size {
}

export interface Size {
    height: number;
    width: number;
}

export type AreaTokenType = 'start' | 'step' | 'step2' | 'siege';

export interface AreaToken {
    areaKey: AreaKey;
    token: AreaTokenType;
}

export interface MapSnapshot {
    transition?: AreaTransition;
    fills: AreaFills;
    tokens: AreaToken[];
}

export type AreaFill = 'active' | 'available' | 'passed' | 'disabled' | 'passed-available';

export interface TilesetTile {
    x: number;
    y: number;
    name: string;
}

export interface TilesetData {
    tiles: TilesetTile[];
    scale: number;
}

export interface AreaTilesetTiles {
    key: AreaKey;
    tiles: TilesetTile[]
}

export interface AreaTileset {
    scale: number;
    areas: AreaTilesetTiles[]
}

export type AreaFills = {
    [key in AreaKey]: AreaFill;
}

export type QualityPreset = 'low' | 'med' | 'max';
