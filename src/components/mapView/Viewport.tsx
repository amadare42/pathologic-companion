import React from 'react';
import { PixiComponent, useApp } from '@inlet/react-pixi';
import { Viewport } from 'pixi-viewport';

const ViewportComponent = PixiComponent("Viewport", {
    create: (props: any) => {
        const viewport = new Viewport({
            worldWidth: 9070,
            worldHeight: 6200,
            ticker: props.app.ticker,
            interaction: props.app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        });
        viewport.on("drag-start", () => console.log("drag-start"));
        viewport.on("drag-end", () => console.log("drag-end"));

        viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate();

        //viewport.scaled = 30;
        return viewport;
    },
    applyProps: (instance, oldProps, newProps) => {
        console.log("applyProps");
    },
    didMount: () => {
        console.log("didMount");
    },
    willUnmount: () => {
        console.log("willUnmount");
    }
});

export default ({ children }: any) => {
    const app = useApp();
    return <ViewportComponent app={app}>{children}</ViewportComponent>;
};

