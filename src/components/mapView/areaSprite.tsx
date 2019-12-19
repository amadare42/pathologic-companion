import React from 'react';
import { AreaTiles } from './loadTextures';
import { AreaKey } from '../../data/areas';
import { Graphics, PixiComponent, Sprite } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';

interface Props {
    area: AreaTiles;
    alpha: number;
    onClick: (key: AreaKey) => void;
}

const HitBox = PixiComponent<{poly: PIXI.Polygon, onClick: () => void}, PIXI.DisplayObject>('HitBox', {
    create: () => new PIXI.DisplayObject(),
    applyProps: (instance, _, props) => {
        const { poly, onClick } = props;

        instance.hitArea = poly;
        instance.interactive = true;
        instance.buttonMode = true;
        instance.on('pointerdown', onClick);
    }
});

export class AreaSprite extends React.Component<Props> {
    render = () => {
        const { area, alpha } = this.props;
        return <>
            <HitBox poly={area.hitArea} onClick={this.onClick} />
            { area.tiles.map(({tex, x, y}, i) => <Sprite alpha={alpha} key={i} x={x} y={y} texture={tex} />)}
        </>;
    };

    onClick = () => {
        const { area, onClick } = this.props;
        onClick(area.key);
    }
}
