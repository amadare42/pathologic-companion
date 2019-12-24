import React from 'react';
import { Container, Sprite, Stage } from '@inlet/react-pixi';
import { AutoSizer } from 'react-virtualized';
import { AreaTransition, Point, Size } from '../../model';
import { LoadTextures, Textures } from './loadTextures';
import { AreaSprite } from './area/areaSprite';
import { AreaKey } from '../../data/areas';
import { AreasInfo } from '../svgMapView';
import ViewPort from './viewport';
import { ClickEventData } from 'pixi-viewport';
import { Transition } from './Transition';
import * as PIXI from 'pixi.js';
import { resolveOnCb } from '../../utils';


window['PIXI'] = PIXI;

interface State {
    textures: Textures | null;
}

interface Props {
    areas: AreasInfo,
    onAreaClick: (key: AreaKey) => void,
    // TODO: transitions
    transition?: AreaTransition
}

export class MapView extends React.Component<Props, State> {

    state: State = {
        textures: null
    };

    private tex = PIXI.Texture.from('/image_133low.jpg');
    // private maskTex = PIXI.Sprite.from('/image_133med.jpg');
    private maskTex = PIXI.Sprite.from('/hand_white.svg');
    private gTex?: any;

    constructor(p: any) {
        super(p);
        // this.createMaskTex()
        //     .then(t => this.gTex = t);
    }

    render = () => {
        return this.renderWrapped(({ textures, width, height }) => {
                return <Stage width={ width } height={ height }>
                    <ViewPort onClick={ this.onClick } screenWidth={ width } screenHeight={ height }>
                        <Container>
                            { this.renderMapTiles(textures) }
                            { this.renderAreaTiles(textures) }
                            { this.renderBorderTiles(textures) }
                            {/*<Transition textures={ textures } transition={ this.props.transition }/>*/}
                        </Container>
                    </ViewPort>
                </Stage>;
            }
        );
    };

    renderMapTiles = (textures: Textures) => {
        return textures.mapTiles.map(({ tex, x, y }, i) =>
            <Sprite name={'area_tile_' + i} key={ i } texture={ tex } x={ x } y={ y }/>
        );
    };

    renderAreaTiles = (textures: Textures) => {
        const { areas } = this.props;
        return textures.areas.map(area => <AreaSprite area={ area } fill={areas[area.key]} />);
    };

    renderBorderTiles = (textures: Textures) => {
        return textures.borderTiles.map(({ tex, x, y }, i) =>
            <Sprite key={ i } texture={ tex } x={ x } y={ y }/>
        );
    };

    private onClick = (data: ClickEventData) => {
        const area = this.traceArea(data.world);
        if (!area) {
            return;
        }
        this.props.onAreaClick(area);
    };

    private traceArea = (point: Point) => {
        const { textures } = this.state;
        if (!textures) {
            return null;
        }
        let area = textures.areas.find(a => a.hitArea.contains(point.x, point.y));
        return (area && area.key) || null;
    };

    private onTexturesLoaded = (textures: Textures) => this.setState({ textures });

    renderWrapped = (child: (arg: Size & { textures: Textures }) => React.ReactNode) => (
        <LoadTextures onLoaded={ this.onTexturesLoaded }>
            { (textures) => {
                if (!textures) return <div
                    style={ { width: '100vw', height: '100vh', backgroundColor: 'white', fontSize: '75px' } }>Loading
                    textures...</div>;
                return <AutoSizer>
                    { ({ width, height }) =>
                        child({ width, height, textures })
                    }
                </AutoSizer>;
            }
            }
        </LoadTextures>
    )
}
