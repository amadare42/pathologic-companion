import { PixiComponent } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';

export const HitBox = PixiComponent<{ poly: PIXI.Polygon, onClick?: () => void }, PIXI.DisplayObject>('HitBox', {
    create: () => {
        const obj = new PIXI.DisplayObject();
        (obj as any)['calculateBounds'] = () => null;
        return obj;
    },
    applyProps: (instance, _, props) => {
        const { poly, onClick } = props;

        instance.hitArea = poly;
        instance.interactive = true;
        instance.buttonMode = true;
        if (onClick) {
            instance.on('pointerdown', onClick);
        }
    }
});
