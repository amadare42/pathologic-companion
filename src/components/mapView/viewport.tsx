import React from 'react';
import { PixiComponent, useApp } from '@inlet/react-pixi';
import { BounceOptions, ClickEventData, Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';

const ViewportComponent = PixiComponent<Props & { app: PIXI.Application }, Viewport>("Viewport", {
    create: (props) => {
        const viewport = new Viewport({
            worldWidth: 9070,
            worldHeight: 6200,
            screenHeight: props.screenHeight,
            screenWidth: props.screenWidth,
            ticker: props.app.ticker,
            // TODO: provide screen coordinates
            interaction: props.app.renderer.plugins.interaction,
        });
        viewport.on('clicked', props.onClick);

        viewport
            .drag()
            .pinch()
            .wheel()
            .bounce({
                time: 300
            } as BounceOptions)
            .decelerate();
        viewport.setZoom(0.1);

        return viewport;
    },
    applyProps(instance, oldProps, newProps): void {
        instance.screenHeight = newProps.screenHeight;
        instance.screenWidth = newProps.screenWidth;
    }
});

interface Props {
    children: any;
    onClick: (data: ClickEventData) => void;
    screenWidth: number;
    screenHeight: number;
}

export default (props: Props) => <ViewportComponent app={useApp()} {...props} children={props.children} />

