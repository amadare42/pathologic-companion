import * as PIXI from "pixi.js";
import { Depromisify } from '../../utils';
import { AreaKey, areaKeys, areasBBoxes, areasDefinitions } from '../../data/areas';
import React, { createContext, ReactNode } from 'react';
import { BBox, Point } from '../../model';

export type TextureTile = { x: number, y: number, tex: PIXI.Texture };
export type Textures = Depromisify<ReturnType<typeof loadTextures>>;
export type AreaTiles = {
    key: AreaKey,
    tex: PIXI.Texture,
    bbox: BBox,
    hitArea: PIXI.Polygon,
    centroid: Point
};

async function loadTextures() {
    console.time('loading textures');
    const textures =  {
        mapTiles: await splitImgToTiles('/image_133max.jpg'),
        borderTiles: await splitImgToTiles('/borders.svg'),
        areas: await loadAreas()
    };
    console.timeEnd('loading textures');

    return textures;
}

function extractTiles(image: HTMLImageElement, width: number = 2048, height: number = 2048) {
    const tiles: TextureTile[] = [];
    const xPieces = image.width / width;
    const yPieces = image.height / height;

    for (let ix = 0; ix < xPieces; ix++) {
        for (let iy = 0; iy < yPieces; iy++) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d')!;
            context.drawImage(image, width * ix, height * iy, width, height, 0, 0, canvas.width, canvas.height);
            tiles.push({
                x: ix * width,
                y: iy * height,
                tex: PIXI.Texture.from(canvas, { mipmap: true })
            });
        }
    }
    return tiles;
}

async function splitImgToTiles(href: string, width: number = 2048, height: number = 2048) {
    var image = new Image();
    var loadPromise = new Promise(r => image.onload = r);
    image.src = href;
    await loadPromise;

    return extractTiles(image, width, height);
}

async function loadAreas() {
    const areas: AreaTiles[] = [];
    // const svg = await loadOffscreenSvg('/polygons/pathologic_mapmax.svg');

    console.time('loading areas');
    for (let areaKey of areaKeys) {
        // let path = svg.querySelector('#' + areaKey) as SVGPathElement;
        const bbox = areasBBoxes[areaKey];

        const centroid = {
            x: bbox.width / 2 + bbox.x,
            y: bbox.height / 2 + bbox.y
        };

        const tex = PIXI.Texture.from(`/polygons/areas_png_low/${areaKey}.png`);
        areas.push({
            key: areaKey,
            bbox,
            tex,
            hitArea: new PIXI.Polygon(areasDefinitions[areaKey].map(({x,y}) => new PIXI.Point(x * 4, y * 4))),
            centroid
        });
    }
    console.timeEnd('loading areas');
    console.log(areas);
    return areas;
}

export async function loadOffscreenSvg(href: string) {
    const container = document.createElement('div');
    const domParser = new window.DOMParser();
    const data = await fetch(href);
    const svgDocument = domParser.parseFromString(await data.text(), 'text/xml');
    container.appendChild(svgDocument.childNodes[0]!);
    const svg = container.lastChild! as SVGSVGElement;
    return svg;
}

export const TexturesContext = createContext<Textures | null>(null);

type State = { textures: Textures | null };
type Props = {
    children: (textures: Textures | null) => ReactNode;
    onLoaded: (textures: Textures) => void;
};

export class LoadTextures extends React.Component<Props, State> {

    state: State = { textures: null };

    componentDidMount(): void {
        loadTextures()
            .then(textures => {
                this.setState({ textures });
                this.props.onLoaded(textures)
            });
    }

    render = () => {
        return <TexturesContext.Provider value={this.state.textures}>
            { this.props.children(this.state.textures) }
        </TexturesContext.Provider>
    }
}
