import React from 'react';
import { PixiComponent, useApp } from '@inlet/react-pixi';
import { BounceOptions, ClickEventData, Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';

const ViewportComponent = PixiComponent<Props & { app: PIXI.Application }, Viewport>("Viewport", {
    create: (props) => {
        const viewport = new Viewport({
            worldWidth: 9070,
            worldHeight: 6200,
            screenHeight: 9070 / 10,
            screenWidth: 6200 / 10,
            ticker: props.app.ticker,
            // TODO: provide screen coordinates
            interaction: props.app.renderer.plugins.interaction,
        });
        viewport.on('clicked', props.onClick);

        viewport
            .drag()
            .pinch()
            .wheel()
            // .clampZoom({
            //     minHeight: 6200 / 6,
            //     maxHeight: 6200
            // })
            // .bounce({
            //     time: 300
            // } as BounceOptions)
            .decelerate();
        viewport.setZoom(0.1);

        return viewport;
    },
    // applyProps: (instance, oldProps, newProps) => {
    //     console.log("applyProps");
    // },
    // didMount: () => {
    //     console.log("didMount");
    // },
    // willUnmount: () => {
    //     console.log("willUnmount");
    // },
});

interface Props {
    children: any;
    onClick: (data: ClickEventData) => void;
    screenWidth: number;
    screenHeight: number;
}

export default (props: Props) => {
    const app = useApp();
    return <ViewportComponent app={app} {...props}>{props.children}</ViewportComponent>;
};

