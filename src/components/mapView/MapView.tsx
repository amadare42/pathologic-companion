import React from 'react';
import { Container, Sprite, Stage } from '@inlet/react-pixi';
import { AutoSizer } from 'react-virtualized';
import { PanZoomInput, PanZoomState } from './panZoom/PanZoomInput';
import { Size } from '../../model';
import PIXI from 'pixi.js';
import { LoadTextures, Textures } from './LoadTextures';

interface State {
}

interface Props {

}

export class MapView extends React.Component<Props, State> {

    state: State = {};

    containerRef = React.createRef<Container>();

    render = () => {

        return this.renderWrapped(({ width, height, scale, pan, textures }) => {
            if (!textures) return <div style={{width: '100vw', height: '100vh', backgroundColor: 'white', fontSize: '75px'}}>Loading textures...</div>;
                return <Stage width={ width } height={ height }>
                    <Container pivot={ [pan.x, pan.y] } ref={ this.containerRef } scale={ scale }>
                        { textures.mapTiles.map(({ tex, x, y }, i) => <Sprite key={ i } texture={ tex } x={ x } y={ y }/>) }
                        { this.renderAreaTiles(textures) }
                        { textures.borderTiles.map(({tex, x, y}, i) => <Sprite key={i} texture={tex} x={x} y={y} /> ) }
                    </Container>
                </Stage>;
            }
        );
    };

    renderAreaTiles = (textures: Textures) => {
        console.log('map');
        var t = textures.areas.flatMap(({ key, tiles, hitArea }) => {
                const areaAlpha = Math.random();
                return tiles.map(({ tex, x, y }, i) =>
                    <Sprite key={ key + i } hitArea={hitArea}  interactive={ true } name={ key } mousemove={ key == 'area01' ? this.onAreaClick : undefined} alpha={ areaAlpha } tint={ 0x000000 } texture={ tex } x={ x }
                            y={ y }/>
                )
            }
        );
        return t;
    };

    private onAreaClick() {
        var sprite = (this as any as PIXI.Sprite);
        sprite.alpha = Math.random();
    }

    renderWrapped = (child: (arg: PanZoomState & Size & { textures: Textures | null }) => React.ReactNode) => (
        <LoadTextures>
            { (textures) =>
                <AutoSizer>
                    { ({ width, height }) => {
                        return (
                            <PanZoomInput
                                children={ panZoom => <div onWheel={ panZoom.onWheel } style={ { width, height } }>
                                    { child({ ...panZoom, width, height, textures }) }
                                </div> }/>);
                    } }
                </AutoSizer>
            }
        </LoadTextures>
    )

}
