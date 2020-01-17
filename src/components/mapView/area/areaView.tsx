import React from 'react';
import { AreaData, Resources } from '../loadResources';
import { AreaKey } from '../../../data/areas';
import { Container, withPixiApp } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { RawDisplayObj } from '../pixiUtils/rawDisplayObj';
import AreaSpriteFill from './areaSpriteFiller';
import { AreaFill, AreaTokenType } from '../../../model';
import { AreaOverlay } from './areaOverlay';
import { SiegeToken } from '../tokens/siegeToken';

interface Props {
    resources: Resources;
    area: AreaData;
    fill: AreaFill;
    tokens: AreaTokenType[];
    onClick?: (key: AreaKey) => void;
    app: PIXI.Application;
}

class AreaView extends React.Component<Props> {

    private maskSprite: PIXI.Sprite;

    constructor(props: Props) {
        super(props);

        this.maskSprite = PIXI.Sprite.from(props.area.mask.tex);
        this.maskSprite.scale = new PIXI.Point(props.area.mask.scale, props.area.mask.scale);
    }

    render = () => {
        const { area, fill, resources } = this.props;
        const { bbox } = area;

        return <Container { ...bbox }>
            <AreaOverlay area={ area } visible={ fill === 'disabled' || fill === 'passed' } app={ this.props.app }/>
            <Container mask={ this.maskSprite } name={ 'area_sprite_container_' + area.key }>
                <RawDisplayObj obj={ this.maskSprite }/>
                <AreaSpriteFill fill={ fill }
                                bbox={ bbox }
                                resources={ resources }
                                sizeMult={ this.getSizeMult(area.key) }
                />
            </Container>
            { this.renderToken() }
        </Container>
    };

    private renderToken = () => {
        const { area, resources } = this.props;
        if (this.props.tokens.some(t => t == 'siege')) {
            return <SiegeToken area={area} resources={resources} app={this.props.app} />
        }
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

export default withPixiApp(AreaView);
