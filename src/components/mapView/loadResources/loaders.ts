import { AreaTileset, BBox, Point, QualityPreset, TilesetData } from '../../../model';
import { splitImgToTiles } from '../pixiUtils/canvasTiling';
import * as PIXI from "pixi.js";
import { AreaKey, areaKeys, areasBBoxes, hitAreas, tokenPositions } from '../../../data/areas';
import { Depromisify } from '../../../utils';
import { Character, characters } from '../../../data/characters';

export interface TextureTile {
    x: number,
    y: number,
    tex: PIXI.Texture,
}

export type Resources = Depromisify<ReturnType<typeof loadResources>>;

export type AreaData = {
    key: AreaKey,
    bbox: BBox,
    overlay: {
        scale: number,
        tiles: TextureTile[]
    },
    mask: {
        scale: number,
        tex: PIXI.Texture
    }
    hitArea: PIXI.Polygon,
    tokenPosition: Point
}


export async function loadResources(app: PIXI.Application, quality: QualityPreset) {
    console.log(`loading ${quality} preset...`);

    const [mapTiles, areas, borderTiles, crows, characterCards] = await timed('total', () => Promise.all([
        timed('map', () => loadMapTiles(quality)),
        timed('areas', () => loadAreas(quality)),
        splitImgToTiles('/borders.svg'),
        loadCrowsTextures(),
        loadCharacterCards(app.loader)
    ]));

    const data = {
        mapTiles,
        areas,
        borderTiles,
        crows,
        characterCards,
        whiteHand: PIXI.Texture.from('icons/hand_white.svg'),
        redHand: PIXI.Texture.from('icons/hand_red.svg'),
        siegeToken: PIXI.Texture.from('icons/siege.png'),
        sizes: {
            hand: 340,
            siegeToken: 437
        }
    };

    console.log('loaded data:', data);
    return data;
}


export async function loadMapTiles(quality: QualityPreset) {
    const rootPath = `map/tiles-${quality}`;
    const indexPath = `${rootPath}/index.json`;

    try {
        const rsp = await fetch(indexPath);
        const { scale, tiles }: TilesetData = await rsp.json();

        return {
            scale,
            tiles: tiles.map(tile => ({
                x: tile.x * scale,
                y: tile.y * scale,
                tex: PIXI.Texture.from(`${ rootPath }/${ tile.name }`, {
                    mipmap: true
                })
            }))
        };
    } catch (e) {
        return {
            scale: 1,
            tiles: []
        }
    }
}

export async function loadAreas(quality: QualityPreset) {
    const overlay = await loadAreaOverlayTiles(quality);
    return areaKeys.map(key => {
        const bbox = areasBBoxes[key];

        const data: AreaData = {
            key,
            bbox,
            overlay: {
                scale: overlay.scale,
                tiles: overlay.tiles[key]
            },
            mask: {
                scale: 4,
                tex: PIXI.Texture.from(`areas/mask/${key}.png`)
            },
            hitArea: new PIXI.Polygon(hitAreas[key].map(({x,y}) => new PIXI.Point(x, y))),
            tokenPosition: tokenPositions[key]
        };
        return data;
    })
}

export async function loadAreaOverlayTiles(quality: QualityPreset) {
    const rootPath = `areas/overlay/${quality}/`;
    const indexPath = `${rootPath}/index.json`;
    const areaTiles: { [key in AreaKey]: TextureTile[] } = {} as any;

    try {
        const rsp = await fetch(indexPath);
        const { scale, areas }: AreaTileset = await rsp.json();

        for (let area of areas) {
            areaTiles[area.key] = area.tiles.map(tile => ({
                tex: PIXI.Texture.from(`${rootPath}${area.key}/${tile.name}`, {
                    mipmap: true
                }),
                x: tile.x * scale,
                y: tile.y * scale
            }))
        }

        return {
            scale,
            tiles: areaTiles
        };
    } catch (e) {
        return {
            scale: 1,
            tiles: {} as typeof areaTiles
        }
    }

}

export function loadCrowsTextures() {
    let textures = [];
    for (let i = 0; i<=17; i++) {
        textures.push(PIXI.Texture.from(`ui/crowSprites/crow_${i}.png`));
    }
    return textures;
}

export async function loadCharacterCards(loader: PIXI.Loader) {
    let obj: { [key: string]: PIXI.BaseTexture } = {} as any;
    loader.on('progress', console.log);
    let onComplete = new Promise(r => loader.onComplete.add(r));
    for (let character of characters) {
        loader.add(`cards/${character.id}.jpg`);
        obj[character.id] = new PIXI.BaseTexture(`cards/${character.id}.jpg`);
    }
    loader.load();
    await onComplete;
    return obj;
}

const timerKeys = {
    total: '[Textures] total',
    areas: '[Textures] > areas',
    map: '[Textures] > map',
    overlay: '[Textures] areas overlay'
};
function timed<T>(key: keyof typeof timerKeys, fn: () => T): T {
    console.time(timerKeys[key]);
    let isPromise = false;
    try {
        const promiseOrResult = fn() as any;
        if (promiseOrResult && promiseOrResult['then']) {
            isPromise = true;
            return promiseOrResult.then((r: any) => {
                console.timeEnd(timerKeys[key]);
                return r;
            })
        }
        return promiseOrResult;
    } finally {
        if (!isPromise) {
            console.timeEnd(timerKeys[key]);
        }
    }
}
