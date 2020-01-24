import React from 'react';
import { AreaData, Resources } from '../loadResources';
import { Sprite } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { TOKENS } from '../constants';

interface Props {
    area: AreaData;
    resources: Resources;
    app: PIXI.Application;
}

export class SiegeToken extends React.Component<Props> {

    sprite: PIXI.Sprite = null as any;
    private animState: number = 0;

    render = () => {
        const { resources, area } = this.props;
        return <Sprite
            ref={ (s: any) => this.sprite = s }
            texture={ resources.siegeToken }
            alpha={ 0 }
            zIndex={ 10 }
            anchor={ 0.5 }
            x={ area.tokenPosition.x }
            y={ area.tokenPosition.y }
        />
    };

    componentDidMount(): void {
        this.sprite.alpha = 0;
        this.sprite.scale = new PIXI.Point(TOKENS.fromScale);
        this.animState = 1;
        this.props.app.ticker.add(this.tick);
    }

    componentWillUnmount(): void {
        this.animState = -1;
    }

    tick = () => {
        const elapsed = this.props.app.ticker.elapsedMS;

        if (!this.sprite) {
            this.props.app.ticker.remove(this.tick);
            return;
        }

        if (this.animState === 0) {
            return;
        }
        const deltaA = elapsed * TOKENS.deltaAlpha;
        const deltaS = elapsed * TOKENS.deltaScale;

        if (this.animState === 1) {
            this.sprite.alpha += deltaA;
            const scale = this.sprite.scale.x - deltaS;

            if (scale <= TOKENS.toScale || this.sprite.alpha >= 1) {
                this.sprite.alpha = 1;
                this.sprite.scale.set(TOKENS.toScale);
                this.animState = 0;
            } else {
                this.sprite.scale.set(scale);
            }
        }
    }
}
