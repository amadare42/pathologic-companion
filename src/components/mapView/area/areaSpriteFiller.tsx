import * as particles from 'pixi-particles';
import * as PIXI from 'pixi.js';
import { AreaFill, BBox } from '../../../model';
import React from 'react';
import { RawDisplayObj } from '../pixiUtils/rawDisplayObj';
import { withPixiApp } from '@inlet/react-pixi';
import { RafTicker, RafTimestamp } from '../pixiUtils/rafTicker';

interface Props {
    fill: AreaFill;
    bbox: BBox;
    sizeMult: number;
    app: PIXI.Application;
}

const FillTime = 1000;
const ParticlesCount = 60;
const FadingStart = 0.8;
const ParticleTtlSpreadPc = 0.1;
const FadingStartOn = FillTime * FadingStart;
const FadingDelta = 1 / FadingStartOn;

const ActiveTint = 0x811000;

class AreaSpriteFill extends React.Component<Props, any> {
    private container: PIXI.Container;
    private rect: PIXI.Sprite;
    private handTex = PIXI.Texture.from('hand_red.svg');
    private emitter: particles.Emitter;

    private ticker: RafTicker;

    private fadingMod: number = 1;
    private shouldResetFreq: boolean = false;

    constructor(props: Props) {
        super(props);
        const { bbox, sizeMult } = props;

        // create area container
        this.container = new PIXI.Container();
        this.container.x = 0;
        this.container.y = 0;

        // create filling rect
        this.rect = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.rect.tint = ActiveTint;
        Object.assign(this.rect, { width: props.bbox.width, height: props.bbox.height });
        this.rect.alpha = 0;
        this.container.addChild(this.rect);

        // create emitter
        this.emitter = this.createEmitter(bbox, sizeMult);
        this.ticker = new RafTicker(this.rafTick);

        this.transitToFill(props.fill);
    }

    private createEmitter(bbox: BBox, sizeMult: number) {
        const baseLifetime = FillTime * 0.001;
        const ttlMod = ParticleTtlSpreadPc * baseLifetime;

        return new particles.Emitter(this.container, [this.handTex], {
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
                min: baseLifetime - ttlMod,
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
            frequency: FillTime / (ParticlesCount * sizeMult) * 0.001,
            maxParticles: ParticlesCount * sizeMult
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
                this.rect.tint = 0x000000;
                this.rect.alpha = 1;
                this.rect.blendMode = PIXI.BLEND_MODES.DARKEN;
                this.emitter.emit = false;
                this.fadingMod = 0;
                break;

            case 'available':
                this.rect.tint = 0xffffff;
                this.rect.alpha = 0.3;
                this.fadingMod = 0;
                break;

            case 'passed':
                this.ticker.start();
                const freq = this.emitter.frequency;
                this.emitter.frequency = 0.001;
                this.emitter.update(0.001 * ParticlesCount * this.props.sizeMult);
                this.rect.alpha = 0.3;
                this.emitter.frequency = freq;
                this.emitter.emit = false;
                this.fadingMod = -1;
                break;

            case 'active':
                this.goToActive();
                break;
        }
    }

    goToActive = () => {
        this.rect.tint = ActiveTint;
        this.ticker.start();
        this.emitter.emit = true;
        this.fadingMod = 1;
    };

    rafTick = (ts: RafTimestamp) => {
        this.updateRect(ts);

        this.emitter.update(ts.elapsed * 0.001);
        if (this.shouldResetFreq) {
            this.emitter.frequency = FillTime / (ParticlesCount * this.props.sizeMult) * 0.001;
            this.emitter.emit = false;
        }
        return true;
    };

    updateRect = (ts: RafTimestamp) => {
        if (ts.elapsedTotal >= FillTime * FadingStart) {
            this.rect.alpha += FadingDelta * this.fadingMod * ts.elapsed;
            if (this.rect.alpha > 1) {
                this.rect.alpha = 1;
            }
            if (this.rect.alpha < 0) {
                this.rect.alpha = 0;
            }
        }
    };

    render = () => {
        return <RawDisplayObj obj={ this.container }/>
    }
}

export default withPixiApp(AreaSpriteFill);
