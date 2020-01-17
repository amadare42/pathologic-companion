import React from 'react';
import { Resources } from './loadResources';
import { Sprite, ParticleContainer } from '@inlet/react-pixi';

interface Props {
    mapTiles: Resources['mapTiles']
}

export class MapBackground extends React.Component<Props> {
    render = () => {
        const { mapTiles } = this.props;
        return <ParticleContainer>
            { mapTiles.tiles.map(({ tex, x, y }, i) =>
                <Sprite name={ 'map_tile_' + i } scale={ mapTiles.scale } key={ i } texture={ tex } x={ x } y={ y }/>
            ) }
        </ParticleContainer>
    };
}
