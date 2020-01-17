import React from 'react';
import { Container, Sprite } from '@inlet/react-pixi';
import { AreaFills, MapSnapshot, Point, QualityPreset } from '../../model';
import { Resources, WithResources, withResources } from './loadResources';
import AreaView from './area/areaView';
import { AreaKey, areaKeys } from '../../data/areas';
import ViewPort from './viewport';
import { ClickEventData } from 'pixi-viewport';
import { MapBackground } from './mapBackground';
import { WithSize } from '../stage/autoSizeContext';

interface Props extends WithSize, WithResources {
    mapSnapshot?: MapSnapshot | null;
    onAreaClick?: (key: AreaKey) => void
}

const emptySnapshot = {
    tokens: [],
    fills: Object.fromEntries(areaKeys.map(key => ([key, 'disabled']))) as AreaFills
} as MapSnapshot;

class MapView extends React.Component<Props> {

    private grayscaleFilter: PIXI.filters.ColorMatrixFilter;

    constructor(props: any) {
        super(props);
        this.grayscaleFilter = new PIXI.filters.ColorMatrixFilter();
        this.grayscaleFilter.desaturate();
    }

    render = () => {
        const { resources, size: { width, height } } = this.props;
        return <ViewPort onClick={ this.onClick } screenWidth={ width } screenHeight={ height }>
            <Container filters={this.props.mapSnapshot?.grayscale ? [this.grayscaleFilter] : []}>
                { this.renderMap(resources) }
                { this.renderAreas(resources) }
                {/*{ this.renderBorders(resources) }*/}
            </Container>
        </ViewPort>
    };

    renderMap = (resources: Resources) => {
        return <MapBackground mapTiles={ resources.mapTiles }/>
    };

    renderAreas = (resources: Resources) => {
        const { fills, tokens } = this.props.mapSnapshot || emptySnapshot;
        return resources.areas.map(area =>
            <AreaView resources={ resources }
                      area={ area }
                      key={ area.key }
                      fill={ fills[area.key] }
                      tokens={ tokens.filter(t => t.areaKey === area.key).map(t => t.token) }
            />);
    };

    renderBorders = (resources: Resources) => {
        return resources.borderTiles.map(({ tex, x, y }, i) =>
            (<Sprite key={ i } texture={ tex } x={ x } y={ y } zIndex={ 9 }/>)
        );
    };

    private onClick = (data: ClickEventData) => {
        const area = this.traceArea(data.world);
        if (!area) {
            return;
        }
        this.props.onAreaClick?.(area);
    };

    private traceArea = (point: Point) => {
        const { resources } = this.props;
        if (!resources) {
            return null;
        }
        let area = resources.areas.find(a => a.hitArea.contains(point.x, point.y));
        return (area && area.key) || null;
    };
}

export default withResources(
    MapView
);
