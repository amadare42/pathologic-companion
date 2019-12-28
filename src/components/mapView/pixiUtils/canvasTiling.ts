import * as PIXI from 'pixi.js';
import { TextureTile } from '../loadResources';

function extractTiles(image: HTMLImageElement, scaleFactor: number = 1, width: number = 1024, height: number = 1024) {
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
                x: ix * width * scaleFactor,
                y: iy * height * scaleFactor,
                tex: PIXI.Texture.from(canvas, { mipmap: true })
            });
        }
    }
    return tiles;
}

export async function splitImgToTiles(href: string, scaleFactor: number = 1, width: number = 2048, height: number = 2048) {
    var image = new Image();
    var loadPromise = new Promise(r => image.onload = r);
    image.src = href;
    await loadPromise;

    return extractTiles(image, scaleFactor, width, height);
}
