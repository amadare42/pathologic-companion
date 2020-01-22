import React from 'react';
import { PixiComponent, useApp } from '@inlet/react-pixi';
import { BounceOptions, ClampZoomOptions, ClickEventData, Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import { SIZES } from './animationConstants';
import { Point } from '../../model';
import { inDebug } from '../../debug';

let debug_obj = {
    centerX: 0,
    centerY: 0,

    cornerX: 0,
    cornerY: 0,

    screenH: 0,
    screenW: 0,

    target: ''
};

let debug_folder = inDebug(gui => {
    const folder = gui.addFolder('viewport');
    folder.open();
    return folder;
});

function attachDebug(viewport: Viewport) {
    inDebug(() => {
        let changing = 0;

        function onChange(key: string, value: any) {
            switch (key) {
                case 'centerX': viewport.moveCenter(value, viewport.center.y); break;
                case 'centerY': viewport.moveCenter(viewport.center.x, value); break;
            }
        }

        Object.keys(debug_obj).map(k => {
                const controller = debug_folder.add(debug_obj, k);
                controller.domElement.querySelector('input')!.addEventListener('focus', () => changing++);
                controller.domElement.querySelector('input')!.addEventListener('focusout', () => changing--);
                return controller.onChange(v => onChange(k, v));
            }
        );

        setInterval(() => {
            (window as any).changing = changing;
            if (changing) return;
            Object.assign(debug_obj, {
                centerX: viewport.center.x,
                centerY: viewport.center.y,

                cornerX: viewport.corner.x,
                cornerY: viewport.corner.y,

                screenH: viewport.worldScreenHeight,
                screenW: viewport.worldScreenWidth,
            });
            debug_folder.updateDisplay();
        }, 100);
    });
}

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
        attachDebug(viewport);

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
        focus(viewport, props.focusOn);
        viewport.setZoom(0.2);
        inDebug(() => (window as any).viewport = viewport);

        return viewport;
    },
    applyProps(viewport, oldProps, props): void {
        viewport.screenHeight = props.screenHeight;
        viewport.screenWidth = props.screenWidth;
        viewport.clamp({
            direction: 'y'
        });
        inDebug(() => Object.assign(debug_obj, {
            target: `${ props.focusOn?.x } ${ props.focusOn?.y }`
        }));
        if (props.focusOn !== oldProps.focusOn) {
            focus(viewport, props.focusOn);
        }
        clampZoom(viewport, props);
    }
});

function focus(viewport: Viewport, focusOn?: Point) {
    if (focusOn) {
        let nX = focusOn.x - viewport.worldScreenWidth / 2;
        let leftExtr = viewport.corner.x < 0 ? viewport.corner.x : 0;
        if (nX < leftExtr) {
            nX = leftExtr;
        }
        let d = (nX + viewport.worldScreenWidth) - viewport.worldWidth + leftExtr;
        if (d > 0) {
            nX -= d;
        }

        let nY = focusOn.y - viewport.worldScreenHeight / 2;
        if (nY < 0) {
            nY = 0;
        }
        viewport.moveCorner(nX, nY);
    }
}

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
    focusOn?: Point;
    screenWidth: number;
    screenHeight: number;
}

export default (props: Props) => <ViewportComponent app={useApp()} {...props} children={props.children} />

