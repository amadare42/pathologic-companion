import { AreaTileset, BBox, Point, QualityPreset, TilesetData } from '../../../model';
import { splitImgToTiles } from '../pixiUtils/canvasTiling';
import * as PIXI from 'pixi.js';
import { AreaKey, areaKeys, areasBBoxes, hitAreas, tokenPositions } from '../../../data/areas';
import { delay, Depromisify } from '../../../utils';
import { characters, healerCharacters } from '../../../data/characters';

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
    console.group(`loading ${quality} preset...`);

    const [mapTiles, areas, crows, characterCards] = await timed('total', () => Promise.all([
        timed('map', () => loadMapTiles('low')),
        timed('areas', () => loadAreas(quality)),
        // splitImgToTiles('/borders.svg'),
        loadCrowsTextures(app.loader),
        loadCharacterCards(app.loader),
    ])).catch(e => {
        console.groupEnd();
        throw e;
    });

    const data = {
        mapTiles,
        areas,
        crows,
        characterCards,
        whiteHand: PIXI.Texture.from('icons/hand_white.svg'),
        redHand: PIXI.Texture.from('icons/hand_red.svg'),
        siegeToken: PIXI.Texture.from('icons/siege.png'),
        cloudTex: PIXI.Texture.from('cards/cloud_tex.png'),
        cardMaskTex: PIXI.Texture.from('cards/card_mask.png'),
        missionCards: [PIXI.Texture.from(`cards/missions/12.jpg`)],
        sizes: {
            hand: 340,
            siegeToken: 437
        }
    };

    console.log('loaded data:', data);
    console.groupEnd();
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

export async function loadCrowsTextures(loader: PIXI.Loader) {
    const data: { width: number, height: number, sprites: Point[] } = await fetch('ui/crowSprites/data.json')
        .then(rsp => rsp.json());

    const baseTex = PIXI.BaseTexture.from('ui/crowSprites/sheet.png');
    const sprites = data.sprites.map(({x, y}) =>
        new PIXI.Texture(baseTex, new PIXI.Rectangle(x, y, data.width, data.height))
    );

    return sprites;
}

export async function loadCharacterCards(loader: PIXI.Loader) {
    let obj: { [key: string]: PIXI.BaseTexture } = {} as any;
    let onComplete = new Promise(r => loader.onComplete.add(r));
    for (let character of [...characters, ...healerCharacters]) {
        loader.add(`cards/${character.id}.jpg`);
        obj[character.id] = new PIXI.BaseTexture(`cards/${character.id}.jpg`, {
            alphaMode: PIXI.ALPHA_MODES.PREMULTIPLIED_ALPHA
        });
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
