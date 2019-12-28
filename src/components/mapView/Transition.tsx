import React from 'react';
import { AreaTransition, Point, Rectangle } from '../../model';
import * as PIXI from 'pixi.js';
import * as particles from 'pixi-particles';
import { _ReactPixi, Graphics, PixiComponent } from '@inlet/react-pixi';
import { Resources } from './loadResources';
import { getRandomInt, pointsEq } from '../../utils';

interface Props {
    from: Point;
    to: Point;
    href: string;
}

interface EmitterExt {
    emitter: EmitterManager | null;
}

const emitterConfig = {
    travelTime: 500
};

const config = {
    "alpha": {
        "start": 0.6,
        "end": 0.5
    },
    "scale": {
        "start": 2,
        "end": 1.95,
        "minimumScaleMultiplier": 1
    },
    // "color": {
    //     "start": "#6bff61",
    //     "end": "#d8ff4a"
    // },
    "speed": {
        "start": 1,
        "end": 1,
        "minimumSpeedMultiplier": 1
    },
    "acceleration": {
        "x": 0,
        "y": 0
    },
    "maxSpeed": 0,
    "startRotation": {
        "min": 0,
        "max": 360
    },
    "noRotation": false,
    "rotationSpeed": {
        "min": 0,
        "max": 0
    },
    "lifetime": {
        "min": (emitterConfig.travelTime * 0.0003),
        "max": (emitterConfig.travelTime * 0.002)
    },
    "blendMode": "normal",
    "frequency": 0.07,
    "emitterLifetime": -1,
    "maxParticles": 60,
    "pos": {
        "x": 0.5,
        "y": 0.5
    },
    "addAtBack": false,
    "spawnType": "circle",
    "spawnCircle": {
        "x": 0,
        "y": 0,
        "r": 500
    }
};



export class EmitterManager {
    private modX: number = 0;
    private modY: number = 0;
    private emitter: particles.Emitter;
    private rafHandle: number;
    private lastTs: number = 0;
    private elapsedTotal: number = 0;

    constructor(container: PIXI.Container, href: string) {
        this.emitter = new particles.Emitter(
            container,
            [PIXI.Texture.from(href, { width: 680, height: 680 })],
            config
        );
        this.rafHandle = requestAnimationFrame(this.tick);
    }

    setCoords(props: { from: Point, to: Point}) {
        const { from, to } = props;
        this.modX = (to.x - from.x) / emitterConfig.travelTime;
        this.modY = (to.y - from.y) / emitterConfig.travelTime;
        this.elapsedTotal = 0;
        this.emitter.emit = true;
        this.emitter.updateSpawnPos(from.x, from.y);
    }

    tick = (timestamp: number) => {
        const { emitter, modX, modY } = this;

        if (this.lastTs === 0) {
            this.lastTs = timestamp;
            requestAnimationFrame(this.tick);
            return;
        }
        const elapsed = timestamp - this.lastTs;
        this.elapsedTotal += elapsed;
        if (this.elapsedTotal >= emitterConfig.travelTime) {
            this.emitter!.emit = false;
        } else {
            emitter.updateSpawnPos(emitter.spawnPos.x + modX * elapsed, emitter.spawnPos.y + modY * elapsed);
            // emitter.startAlpha.value = getRandomInt(5, 10) * 0.1;
        }

        emitter.update(elapsed * 0.001);
        this.lastTs = timestamp;
        requestAnimationFrame(this.tick);
    }

    dispose = () => {
        cancelAnimationFrame(this.rafHandle);
    }
}

const Emitter = PixiComponent<Props, PIXI.Container>("Emitter", {
    emitter: null,
    create: () => new PIXI.Container(),
    applyProps(instance, prevProps, props) {
        if (!this.emitter) {
            this.emitter = new EmitterManager(instance, props.href);
        }
        const isInit = !prevProps.to && props.to;
        const isChanged = prevProps.to && !pointsEq(prevProps.to, props.to);
        if (isInit || isChanged) {
            this.emitter.setCoords(props);
        }
    },
    willUnmount(): void {
        this.emitter?.dispose();
    }
} as (_ReactPixi.ICustomComponent<Props, PIXI.Container> & EmitterExt));

interface TransitionProps {
    transition?: AreaTransition;
    resources: Resources;
}

export class Transition extends React.Component<TransitionProps> {

    render = () => {
        const {transition, resources} = this.props;
        console.log(transition);
        if (!transition) return null;

        const from = resources.areas.find(a => a.key === transition.from);
        const to = resources.areas.find(a => a.key === transition.to);
        console.log(from, to);
        return <Emitter href={'/hand_red.svg'} from={from!.tokenPosition} to={to!.tokenPosition} />
    }
}
