import * as particles from 'pixi-particles';
import * as PIXI from 'pixi.js';
import { AreaFill, BBox } from '../../../model';
import React from 'react';
import { RawDisplayObj } from '../pixiUtils/rawDisplayObj';
import { withPixiApp } from '@inlet/react-pixi';
import { RafTicker, RafTimestamp } from '../pixiUtils/rafTicker';
import { AREA, COLORS } from '../animationConstants';
import { Resources } from '../loadResources';
import { inDebug } from '../../../debug';
import { AreaKey, areaKeys } from '../../../data/areas';

interface Props {
    areaKey: AreaKey;
    fill: AreaFill;
    bbox: BBox;
    sizeMult: number;
    app: PIXI.Application;
    resources: Resources;
}

let debug_obj = Object.fromEntries(areaKeys.map(key => ([key, 'disabled'])))

inDebug(gui => {
    const folder = gui.addFolder('Area fills');
    Object.keys(debug_obj).forEach(k => {
        folder.add(debug_obj, k).listen();
    })
});

class AreaSpriteFill extends React.Component<Props, any> {
    private container: PIXI.Container;
    private rect: PIXI.Sprite;
    private emitter: particles.Emitter;

    private ticker: RafTicker;

    private fadingMod: number = 1;
    private maxAlpha: number = 1;
    private minAlpha: number = 0;
    private skipDelay: boolean = false;

    constructor(props: Props) {
        super(props);

        const { bbox, sizeMult } = props;

        // create area container
        this.container = new PIXI.Container();
        this.container.x = 0;
        this.container.y = 0;

        // create filling rect
        this.rect = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.rect.tint = COLORS.activeTint;
        Object.assign(this.rect, { width: props.bbox.width, height: props.bbox.height });
        this.rect.alpha = 0;
        this.container.addChild(this.rect);

        // create emitter
        this.emitter = this.createEmitter(bbox, sizeMult);
        this.ticker = new RafTicker(this.rafTick);

        this.transitToFill(props.fill, props.fill);
    }

    private createEmitter(bbox: BBox, sizeMult: number) {
        return new particles.Emitter(this.container, [this.props.resources.redHand], {
            scale: {
                start: 2,
                end: 2
            },
            speed: {
                start: 1,
                end: 1,
                minimumSpeedMultiplier: 1
            },
            startRotation: {
                min: 0,
                max: 360
            },
            noRotation: false,
            lifetime: this.getLifetime(),
            spawnType: 'rect',
            spawnRect: {
                x: 0,
                y: 0,
                w: bbox.width,
                h: bbox.height
            },
            pos: {
                x: 0,
                y: 0
            },
            frequency: (AREA.fillTime / (AREA.particlesCount * sizeMult)) * 0.001,
            maxParticles: AREA.particlesCount * sizeMult
        });
    }

    getLifetime = (scale: number = 1) => {
        const baseLifetime = (AREA.fillTime + AREA.fillTime * AREA.fadingStart) * 0.001;
        const ttlMod = AREA.particlesTtlSpread * baseLifetime;

        return {
            min: baseLifetime * scale,
            max: (baseLifetime + ttlMod) * scale
        };
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<any>, nextContext: any): boolean {
        if (nextProps === this.props) return false;

        if (nextProps.fill !== this.props.fill) {
            this.transitToFill(nextProps.fill, this.props.fill);
        }

        return true;
    }

    transitToFill = (fill: AreaFill, prevFill: AreaFill) => {
        if (fill !== prevFill && prevFill === 'active') {
            let lt = this.getLifetime(0.3);
            this.emitter.minLifetime = lt.min;
            this.emitter.maxLifetime = lt.max;

            this.emitter.emit = true;
            this.emitter.update(AREA.fillTime * 0.001);
            this.emitter.emit = false;
        } else {
            let lt = this.getLifetime();
            this.emitter.minLifetime = lt.min;
            this.emitter.maxLifetime = lt.max;
        }

        switch (fill) {
            case 'disabled':
            case 'available':
                this.goToDisabled();
                break;

            case 'passed':
            case 'passed-available':
                this.goToPassed();
                break;

            case 'active':
                this.goToActive();
                break;
        }
        inDebug(() => debug_obj[this.props.areaKey] = `${prevFill} > ${fill}`);
        // console.log(debug_obj, this.props.key)
    };

    goToPassed = () => {
        this.rect.tint = COLORS.passedTint;
        this.skipDelay = true;
        if (this.rect.alpha > 0.65) {
            this.minAlpha = 0.65;
            this.maxAlpha = 1;
            this.fadingMod = -1;
        } else {
            this.maxAlpha = 0.5;
            this.minAlpha = 0;
            this.fadingMod = 1;
        }
        this.ticker.start();
    };

    goToDisabled = () => {
        this.emitter.emit = false;
        this.skipDelay = true;
        this.fadingMod = -1;
        this.minAlpha = 0;
        this.ticker.start();
    };

    goToActive = () => {
        this.rect.tint = COLORS.activeTint;
        this.ticker.start();
        this.emitter.emit = true;
        this.skipDelay = false;
        this.fadingMod = 1;
        this.maxAlpha = 1;
    };

    rafTick = (ts: RafTimestamp) => {
        this.updateRect(ts);

        this.emitter.update(ts.elapsed * 0.001);
        if (ts.elapsedTotal > AREA.fillTime) {
            this.emitter.emit = false;
        }
        return true;
    };

    updateRect = (ts: RafTimestamp) => {
        if (this.skipDelay || ts.elapsedTotal >= AREA.fillTime * AREA.fadingStart) {
            this.rect.alpha += AREA.fadingDelta * this.fadingMod * ts.elapsed;
            if (this.rect.alpha > this.maxAlpha) {
                this.rect.alpha = this.maxAlpha;
            }
            if (this.rect.alpha < this.minAlpha) {
                this.rect.alpha = this.minAlpha;
            }
            if (this.rect.alpha === this.maxAlpha && this.fadingMod >= 0 && this.emitter.particleCount === 0) {
                this.ticker.stop();
            }
        }
    };

    render = () => {
        return <RawDisplayObj obj={ this.container }/>
    };

    componentWillUnmount(): void {
        this.ticker.stop();
    }
}

export default withPixiApp(AreaSpriteFill);
