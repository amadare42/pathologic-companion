import React from 'react';
import { AreaTiles } from '../loadTextures';
import { AreaKey, areasBBoxes } from '../../../data/areas';
import { Container, PixiComponent } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { EmitterManager } from '../Transition';
import { refs } from '../../../utils';
import { RawDisplayObj } from '../pixiUtils/rawDisplayObj';
import AreaSpriteFill from './areaSpriteFiller';
import { AreaFill } from '../../../model';

interface Props {
    area: AreaTiles;
    fill: AreaFill;
    onClick?: (key: AreaKey) => void;
}

const HitBox = PixiComponent<{ poly: PIXI.Polygon, onClick?: () => void }, PIXI.DisplayObject>('HitBox', {
    create: () => {
        const obj = new PIXI.DisplayObject();
        (obj as any)['calculateBounds'] = () => null;
        return obj;
    },
    applyProps: (instance, _, props) => {
        const { poly, onClick } = props;

        instance.hitArea = poly;
        instance.interactive = true;
        instance.buttonMode = true;
        if (onClick) {
            instance.on('pointerdown', onClick);
        }
    }
});

export class AreaSprite extends React.Component<Props> {

    private maskSprite: PIXI.Sprite;
    private particleContainer: PIXI.Container;

    constructor(props: Props) {
        super(props);

        this.maskSprite = PIXI.Sprite.from(refs.maskPath(props.area.key));
        // Assuming 25% of size
        this.maskSprite.scale = new PIXI.Point(4, 4);

        this.particleContainer = new PIXI.Container();
    }

    render = () => {
        const { area, fill } = this.props;
        const { bbox } = area;

        return <Container { ...bbox }  mask={ this.maskSprite }  name={ 'area_sprite_container_' + area.key }>
            <RawDisplayObj obj={ this.maskSprite } assign={ { x: 0, y: 0 } }/>
            <AreaSpriteFill fill={fill}
                            bbox={bbox}
                            sizeMult={ this.getSizeMult(area.key) }
            />
        </Container>
    };

    private getSizeMult(key: AreaKey) {
        switch (key) {

            case 'area13':
                return 1.7;

            case 'area01':
            case 'steppe01':
                return 2;

            case 'steppe03':
                return 3;

            default:
                return 1;
        }
    }
}
