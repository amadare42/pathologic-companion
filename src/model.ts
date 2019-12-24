import { AreaKey } from './data/areas';

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

export type AreaFill = 'active' | 'available' | 'passed' | 'disabled';
