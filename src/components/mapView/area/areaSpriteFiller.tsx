import * as particles from 'pixi-particles';
import * as PIXI from 'pixi.js';
import { AreaFill, BBox } from '../../../model';
import React from 'react';
import { RawDisplayObj } from '../pixiUtils/rawDisplayObj';
import { withPixiApp } from '@inlet/react-pixi';
import { RafTicker, RafTimestamp } from '../pixiUtils/rafTicker';
import { AREA, COLORS } from '../animationConstants';
import { Resources } from '../loadResources';

interface Props {
    fill: AreaFill;
    bbox: BBox;
    sizeMult: number;
    app: PIXI.Application;
    resources: Resources;
}

class AreaSpriteFill extends React.Component<Props, any> {
    private container: PIXI.Container;
    private rect: PIXI.Sprite;
    private emitter: particles.Emitter;

    private ticker: RafTicker;

    private fadingMod: number = 1;

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

        this.transitToFill(props.fill);
    }

    private createEmitter(bbox: BBox, sizeMult: number) {
        const baseLifetime = AREA.fillTime * 0.001;
        const ttlMod = AREA.particlesTtlSpread * baseLifetime;

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
            lifetime: {
                min: baseLifetime,
                max: baseLifetime + ttlMod
            },
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
            frequency: AREA.fillTime / (AREA.particlesCount * sizeMult) * 0.001,
            maxParticles: AREA.particlesCount * sizeMult
        });
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<any>, nextContext: any): boolean {
        if (nextProps === this.props) return false;

        if (nextProps.fill !== this.props.fill) {
            this.transitToFill(nextProps.fill, this.props.fill);
        }

        return false;
    }

    transitToFill = (fill: AreaFill, prevFill?: AreaFill) => {
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
    };

    goToPassed = () => {
        this.rect.tint = COLORS.passedTint;
        this.rect.alpha = 1;
    };

    goToDisabled = () => {
        this.rect.alpha = 0;
        this.emitter.emit = false;
        this.fadingMod = -1;
    };

    goToActive = () => {
        this.rect.tint = COLORS.activeTint;
        this.ticker.start();
        this.emitter.emit = true;
        this.fadingMod = 1;
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
        if (ts.elapsedTotal >= AREA.fillTime * AREA.fadingStart) {
            this.rect.alpha += AREA.fadingDelta * this.fadingMod * ts.elapsed;
            if (this.rect.alpha > 1) {
                this.rect.alpha = 1;
            }
            if (this.rect.alpha < 0) {
                this.rect.alpha = 0;
            }
            if (this.rect.alpha === 1 && this.fadingMod >= 0 && this.emitter.particleCount === 0) {
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
