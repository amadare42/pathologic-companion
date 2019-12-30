import { Sprite, Stage, useApp } from '@inlet/react-pixi'
import React from 'react';
import * as PIXI from 'pixi.js';

export const TransparentFrame = () => {
    return <Stage width={1000} height={300} color={'transparent'}>
        <Foo />
        <Sprite alpha={0} texture={PIXI.Texture.from('map/tiles-low/0_0.jpg')} />
    </Stage>
}

const Foo = () => {
    const app = useApp();
    app.renderer.transparent = true;
    return null;
}
