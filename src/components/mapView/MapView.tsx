import React from 'react';
import { Container, PixiComponent, Sprite, Stage } from '@inlet/react-pixi';
import { AutoSizer } from 'react-virtualized';
import { PanZoomInput, PanZoomState } from './panZoom/PanZoomInput';
import { Size } from '../../model';
import * as PIXI from 'pixi.js';
import { LoadTextures, Textures } from './loadTextures';
import { AreaSprite } from './areaSprite';
import { AreaKey } from '../../data/areas';
import { AreasInfo } from '../svgMapView';

interface State {
}

interface Props {
    areas: AreasInfo,
    onAreaClick: (key: AreaKey) => void,
    // TODO: transitions
    transition?: any
}

export class MapView extends React.Component<Props, State> {

    state: State = {};
    isMoving = false;

    containerRef = React.createRef<Container>();

    render = () => {
        return this.renderWrapped(({ width, height, scale, pan, textures, isPanning, isScaling }) => {
            this.isMoving = isPanning || isScaling;
                return <Stage width={ width } height={ height }>
                    <Container pivot={ [pan.x, pan.y] } ref={ this.containerRef } scale={ scale }>
                        { textures.mapTiles.map(({ tex, x, y }, i) => <Sprite key={ i } texture={ tex } x={ x } y={ y }/>) }
                        { this.renderAreaTiles(textures) }
                        { textures.borderTiles.map(({ tex, x, y }, i) => <Sprite key={ i } texture={ tex } x={ x }
                                                                                 y={ y }/>) }
                    </Container>
                </Stage>;
            }
        );
    };

    renderAreaTiles = (textures: Textures) => {
        const { areas } = this.props;
        return textures.areas.map(area => <AreaSprite area={ area } alpha={ areas[area.key] == 'active' ? 1 : 0 }
                                                      onClick={ this.onAreaClick }/>);
    };

    private onAreaClick = (key: AreaKey) => {
        if (!this.isMoving) {
            this.props.onAreaClick(key);
        }
    }

    renderWrapped = (child: (arg: PanZoomState & Size & { textures: Textures }) => React.ReactNode) => (
        <LoadTextures>
            { (textures) => {
                if (!textures) return <div
                    style={ { width: '100vw', height: '100vh', backgroundColor: 'white', fontSize: '75px' } }>Loading
                    textures...</div>;
                return <AutoSizer>
                    { ({ width, height }) => {
                        return (
                            <PanZoomInput
                                children={ panZoom => <div key={ '2' } onWheel={ panZoom.onWheel }
                                                           style={ { width, height } }>
                                    { child({ ...panZoom, width, height, textures }) }
                                </div> }/>);
                    } }
                </AutoSizer>;
            }
            }
        </LoadTextures>
    )

}
