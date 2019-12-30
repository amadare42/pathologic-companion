import React from 'react';
import { PixiComponent, useApp } from '@inlet/react-pixi';
import { BounceOptions, ClampZoomOptions, ClickEventData, Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import { SIZES } from './animationConstants';

const ViewportComponent = PixiComponent<Props & { app: PIXI.Application }, Viewport>("Viewport", {
    create: (props) => {
        const viewport = new Viewport({
            worldWidth: SIZES.worldWidth,
            worldHeight: SIZES.worldHeight,
            screenHeight: props.screenHeight,
            screenWidth: props.screenWidth,
            ticker: props.app.ticker,
            interaction: props.app.renderer.plugins.interaction,
        });
        viewport.on('clicked', props.onClick);

        viewport
            .drag({
                factor: 1
            })
            .pinch()
            .wheel()
            .bounce({
                time: 300,
                sides: 'horizontal'
            } as BounceOptions)
            .decelerate({
                friction: 0.8
            });
        clampZoom(viewport, props);
        viewport.setZoom(0.1);

        return viewport;
    },
    applyProps(viewport, oldProps, props): void {
        viewport.screenHeight = props.screenHeight;
        viewport.screenWidth = props.screenWidth;
        viewport.clamp({
            direction: 'y'
        });
        clampZoom(viewport, props);
    }
});

function clampZoom(viewport: Viewport, props: Props) {

    const options: ClampZoomOptions = props.screenWidth > props.screenHeight
        ? { maxHeight: SIZES.worldHeight, minHeight: SIZES.worldHeight / 5 }
        : { maxHeight: SIZES.worldHeight, minHeight: SIZES.worldHeight / 5 };
        // : { maxWidth: SIZES.worldWidth, minWidth: SIZES.worldWidth / 5 };

    viewport
        .clampZoom(options);
}

interface Props {
    children: any;
    onClick: (data: ClickEventData) => void;
    screenWidth: number;
    screenHeight: number;
}

export default (props: Props) => <ViewportComponent app={useApp()} {...props} children={props.children} />

