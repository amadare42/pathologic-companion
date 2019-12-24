import { PixiComponent } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';

export const RawDisplayObj = PixiComponent<{ obj: PIXI.DisplayObject, assign?: any }, PIXI.DisplayObject>('RawObj', {
    create: (props) => {
        if (props.assign) {
            Object.assign(props.obj, props.assign);
        }
        return props.obj
    }
});
