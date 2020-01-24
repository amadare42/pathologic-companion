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
import { inDebug } from '../../debug';
import * as PIXI from 'pixi.js';

interface Props extends WithSize, WithResources {
    mapSnapshot?: MapSnapshot | null;
    onAreaClick?: (key: AreaKey) => void
}

const emptySnapshot = {
    tokens: [],
    fills: Object.fromEntries(areaKeys.map(key => ([key, 'disabled']))) as AreaFills
} as MapSnapshot;

let debug_obj = {
    ...emptySnapshot.fills,
    focusArea: ''
};

let debug_folder = inDebug(gui => {
    const folder = gui.addFolder('MapView');
    Object.keys(debug_obj).forEach(k => {
        folder.add(debug_obj, k).listen();
    });
    return folder;
});

class MapView extends React.Component<Props> {

    private grayscaleFilter: PIXI.filters.ColorMatrixFilter;

    private sprites: any = {};

    constructor(props: any) {
        super(props);
        this.grayscaleFilter = new PIXI.filters.ColorMatrixFilter();
        this.grayscaleFilter.desaturate();

        inDebug(() => {
            let focus_obj = {
                areaToFocus: 'area01',
                setArea: () => {
                    this.props.mapSnapshot!.focusOn = focus_obj.areaToFocus as any;
                    this.forceUpdate();
                }
            };
            debug_folder.add(focus_obj, 'areaToFocus', areaKeys).onChange(v => {
                focus_obj.areaToFocus = v;
                focus_obj.setArea();
            });
            debug_folder.add(focus_obj, 'setArea');
        });
    }

    render = () => {
        const { resources, size: { width, height } } = this.props;

        inDebug(() => Object.assign(debug_obj, this.props.mapSnapshot?.fills, { focusArea: this.props.mapSnapshot?.focusOn }));

        return <ViewPort onClick={ this.onClick } screenWidth={ width } screenHeight={ height } focusOn={this.getFocusOn()}>
            <Container filters={this.props.mapSnapshot?.grayscale ? [this.grayscaleFilter] : []}>
                { this.renderMap(resources) }
                { this.renderAreas(resources) }
            </Container>
        </ViewPort>
    };

    getFocusOn = () => {
        if (!this.props.mapSnapshot || !this.props.mapSnapshot.focusOn) {
            return;
        }
        const { focusOn } = this.props.mapSnapshot;
        const bbox =  this.props.resources.areas.find(a => a.key === focusOn)!.bbox;

        switch (focusOn) {
            case 'steppe01':
                return {
                    x: bbox.x,
                    y: bbox.y + bbox.height
                };

            case 'steppe02':
                return {
                    x: bbox.x + bbox.width / 2,
                    y: bbox.y + bbox.height
                };

            case 'steppe03':
                return {
                    x: bbox.x + bbox.width,
                    y: bbox.y + bbox.height
                };

            default:
                return {
                    x: bbox.x + bbox.width / 2,
                    y: bbox.y + bbox.height / 2
                }
        }
    };

    renderMap = (resources: Resources) => {
        return <MapBackground mapTiles={ resources.mapTiles }/>
    };

    renderAreas = (resources: Resources) => {
        const { fills, tokens } = this.props.mapSnapshot || emptySnapshot;
        return resources.areas.map(area =>
            <AreaView resources={ resources }
                      area={ area }
                      pixiRef={(v) => this.sprites[area.key] = v }
                      key={ area.key }
                      fill={ fills[area.key] }
                      tokens={ tokens.filter(t => t.areaKey === area.key).map(t => t.token) }
            />);
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
