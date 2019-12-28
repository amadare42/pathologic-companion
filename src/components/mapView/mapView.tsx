import React from 'react';
import { Container, Sprite, Stage, withPixiApp } from '@inlet/react-pixi';
import { AutoSizer } from 'react-virtualized';
import { MapSnapshot, Point, QualityPreset, Size } from '../../model';
import { LoadResources, Resources, ResourcesContext } from './loadResources';
import AreaView from './area/areaView';
import { AreaKey } from '../../data/areas';
import ViewPort from './viewport';
import { ClickEventData } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import { MapLoading } from './mapLoading';
import { MapBackground } from './mapBackground';

// DEBUG THINGS
window['PIXI'] = PIXI;

interface State {
    resources: Resources | null;
}

interface Props {
    mapSnapshot: MapSnapshot;
    onAreaClick: (key: AreaKey) => void,
    app: PIXI.Application;
    qualityPreset?: QualityPreset;
}

class MapView extends React.Component<Props, State> {

    state: State = {
        resources: null
    };

    componentDidUpdate(): void {
        const props = this.props;
        if (this.props.app) {

            if (!(window as any)['addedFps']) {
                let el = 0;
                let frames = 0;
                props.app.ticker.maxFPS = 200;
                props.app.ticker.add((elapsed) => {
                    el += elapsed;
                    frames++;
                    if (el >= 1000) {
                        el = 0;
                        console.log(frames);
                    }
                });
                (window as any)['addedFps'] = true;
                console.log('added!');
            }
        }
    }

    render = () => {
        const resources = this.state.resources;
        return this.renderWrapped(({ width, height }) => {
                return <Stage width={ width } height={ height }>
                    { resources ?
                        <ResourcesContext.Provider value={ resources }>
                            <ViewPort onClick={ this.onClick } screenWidth={ width } screenHeight={ height }>
                                <Container>
                                    { this.renderMap(resources) }
                                    { this.renderAreas(resources) }
                                    { this.renderBorders(resources) }
                                </Container>
                            </ViewPort>
                        </ResourcesContext.Provider>
                        : null }
                </Stage>;
            }
        );
    };

    renderMap = (resources: Resources) => {
        return <MapBackground mapTiles={ resources.mapTiles }/>
    };

    renderAreas = (resources: Resources) => {
        const { fills, tokens } = this.props.mapSnapshot;
        return resources.areas.map(area =>
            <AreaView resources={ resources }
                      area={ area }
                      fill={ fills[area.key] }
                      tokens={ tokens.filter(t => t.areaKey === area.key).map(t => t.token) }
            />);
    };

    renderBorders = (resources: Resources) => {
        return resources.borderTiles.map(({ tex, x, y }, i) =>
            <Sprite key={ i } texture={ tex } x={ x } y={ y } zIndex={ 9 }/>
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
        const { resources } = this.state;
        if (!resources) {
            return null;
        }
        let area = resources.areas.find(a => a.hitArea.contains(point.x, point.y));
        return (area && area.key) || null;
    };

    private onTexturesLoaded = (resources: Resources) => this.setState({ resources });

    renderWrapped = (child: (arg: Size) => React.ReactNode) => (
        <LoadResources onLoaded={ this.onTexturesLoaded } qualityPreset={ this.props.qualityPreset || 'med' }>
            { (resources) => {
                if (!resources)
                    return <MapLoading/>;

                return <AutoSizer>
                    { ({ width, height }) =>
                        child({ width, height })
                    }
                </AutoSizer>;
            } }
        </LoadResources>
    )
}

export default withPixiApp(MapView);
