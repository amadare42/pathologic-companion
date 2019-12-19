import { Texture, Polygon, Circle, IHitArea } from "pixi.js";
import { Depromisify } from '../../utils';
import { AreaKey, areaKeys, areasBBoxes, areasDefinitions } from '../../data/areas';
import React, { createContext, ReactNode } from 'react';

export type TextureTile = { x: number, y: number, tex: Texture };
export type Textures = Depromisify<ReturnType<typeof loadTextures>>;
export type AreaTiles = {
    key: AreaKey,
    tiles: TextureTile[],
    hitArea: IHitArea
};

async function loadTextures() {
    return {
        mapTiles: await splitImgToTiles('/image_133max.jpg'),
        borderTiles: await splitImgToTiles('/borders.svg'),
        areas: await loadAreas()
    }
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
                tex: Texture.from(canvas, { mipmap: true })
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
    const svg = await loadOffscreenSvg('/polygons/pathologic_mapmax.svg');

    console.time('loading areas');
    for (let areaKey of areaKeys) {
        let path = svg.querySelector('#' + areaKey) as SVGPathElement;
        const bbox = areasBBoxes[areaKey];

        const canvas = document.createElement('canvas');
        canvas.width = bbox.width;
        canvas.height = bbox.height;
        const context = canvas.getContext('2d')!;

        context.fill(new Path2D(path.getAttribute('d')!));
        const tiles = await splitImgToTiles('/polygons/areas_png/' + areaKey + '.png');
        tiles.forEach(tile => {
            tile.x += bbox.x;
            tile.y += bbox.y;
        });
        areas.push({
            key: areaKey, tiles,
            // hitArea: new Polygon(areasDefinitions[areaKey].map(({x,y}) => ([bbox.x - x, bbox.y - y])))
            hitArea: new Circle(bbox.width / 2, bbox.height / 2, 300)
        });
    }
    console.timeEnd('loading areas');
    console.log(areas);
    return areas;
}

async function loadOffscreenSvg(href: string) {
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
type Props = { children: (textures: Textures | null) => ReactNode };

export class LoadTextures extends React.Component<Props, State> {

    state: State = { textures: null };

    componentDidMount(): void {
        loadTextures()
            .then(textures => this.setState({ textures }))
    }

    render = () => {
        return <TexturesContext.Provider value={this.state.textures}>
            { this.props.children(this.state.textures) }
        </TexturesContext.Provider>
    }
}
