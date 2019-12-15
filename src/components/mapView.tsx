import { AreaFill, AreaTransition, Point } from '../model';
import { AreaKey, areaKeys } from '../data/areas';
import React, { createRef } from 'react';
import { getRandomInt, refs, zero } from '../utils';
import { AutoSizer } from 'react-virtualized';
import Hammer from 'react-hammerjs';
import { AreaPolygons, GradientDefs, MaskDefs } from './AreaMap';
import { mapViewService } from '../MapViewService';
import { ReactComponent as Borders } from '../images/borders.svg';
import { ReactComponent as Labels } from '../images/labels.svg';
import { TransitionParticles } from './transitionParticles';
import { AvailableAreaParticles } from './availableAreaParticles';
import * as d3 from 'd3';

interface State {
    scale: number,
    scaleStart: number,
    pan: Point,
    lastDelta: Point,
    scaleCenter: Point,
    isPanning: boolean,
    isZooming: boolean,

    // remove
    points: Point[],
}

export type AreasInfo = {
    [areaKey in AreaKey]: AreaFill
}

interface Props {
    areas: AreasInfo,
    transition?: AreaTransition,
    onAreaClick: (area: AreaKey) => void
}

export class MapView extends React.Component<Props, State> {

    state: State = {
        scale: 1,
        scaleStart: 1,
        pan: zero(),
        lastDelta: zero(),
        scaleCenter: zero(),
        points: [],
        isPanning: false,
        isZooming: false
    };

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps === this.props) return;
        for (let areaKey of areaKeys) {
            const fill = this.props.areas[areaKey];
            const prevFill = prevProps.areas[areaKey];
            mapViewService.setAreaFill(areaKey, fill, prevFill);
        }
        mapViewService.arrangeBorders();
    }

    componentDidMount(): void {
        for (let areaKey of areaKeys) {
            const fill = this.props.areas[areaKey];
            mapViewService.setAreaFill(areaKey, fill, 'disabled');
        }

        setInterval(() => {
            mapViewService.createHand(d3.select(refs.rootSvg('idSelector')), {
                y: 500 + getRandomInt(-150, 150),
                x: 500 + getRandomInt(-150, 150),
                angle: getRandomInt(0, 180),
                href: '/hand_white.svg'
            }, 340)
                .style('opacity', 0.8)
                .transition()
                .delay(16)
                .style('opacity', 1e-6)
                .remove();
        }, 16);
    }

    private isPan: boolean = false;
    private isZoom: boolean = false;

    svgCanvasRef = createRef<SVGSVGElement>();



    render = () => {
        const { pan, scale } = this.state;
        const { transition } = this.props;
        return <AutoSizer>
            { ({ width, height }) =>
                <Hammer options={ {
                    recognizers: {
                        pinch: { enable: true }
                    }
                } }
                        onPan={ this.onPan } onPanStart={ this.onPanStart } onPanEnd={ this.onPanEnd }
                        onPinch={ this.onPinch } onPinchStart={ this.onPinchStart } onPinchEnd={ this.onPinchEnd }>
                    <svg id={ refs.rootSvg() } width={ width } height={ height } ref={ this.svgCanvasRef }
                        // onClick={this.onClick}
                         viewBox={ `${ pan.x } ${ pan.y } ${ width / scale } ${ height / scale }` }
                         onWheel={ this.onWheel }>
                        <defs>
                            <GradientDefs/>
                            <MaskDefs/>
                        </defs>

                        <image href="/image_133max.jpg" width="2268px" height="1552px"/>
                        {/*<AreaPolygons onAreaClick={ this.onAreaClickProxy }/>*/}
                        <g fill={ 'url(#fill-active)' }>
                            <polygon points={ this.state.points.map(p => `${ p.x },${ p.y }`).join(' ') }/>
                        </g>
                        <TransitionParticles transition={transition} />
                        { this.renderActiveAriaParticles() }

                        {/*<circle cx={379} cy={544} r={10} />*/}

                        {/*<Labels style={{pointerEvents: 'none'}} />*/}
                        {/*<Borders id={'def_borders'} style={{pointerEvents: 'none'}} />*/}
                        <Borders style={{pointerEvents: 'none'}} />
                    </svg>
                </Hammer> }
        </AutoSizer>
    };

    private renderActiveAriaParticles = () => {
        return areaKeys.filter(key => this.props.areas[key] === 'available')
            .map(key => <AvailableAreaParticles key={key} areaKey={key} />);
    };

    private onAreaClickProxy = (areaKey: AreaKey) => {
        if (this.isZoom || this.isPan) return;
        this.props.onAreaClick(areaKey)
    };

    private onWheel = (event: React.WheelEvent) => {
        this.setState({ scale: this.state.scale - event.deltaY / 3000 });
    };

    private onClick = (event: React.MouseEvent<any>) => {
        if (this.isPan) return;
        const x = event.clientX / this.state.scale + this.state.pan.x;
        const y = event.clientY / this.state.scale + this.state.pan.y;
        const points = [...this.state.points, { x, y }];
        console.log(points);
        this.setState({
            points
        });
    };

    private onPinch = (event: HammerInput) => {
        this.setState({
            scale: this.state.scaleStart * event.scale,
        });
    };

    private onPinchEnd = (event: HammerInput) => {
        this.isZoom = false;
        this.setState({
            scaleStart: this.state.scale
        })
    };

    private onPinchStart = (event: HammerInput) => {
        this.isZoom = true;
    };

    private onPanStart = (event: HammerInput) => {
        this.isPan = true;
        this.setState({
            lastDelta: { x: event.deltaX, y: event.deltaY }
        });
    };

    private onPanEnd = (event: HammerInput) => {
        setTimeout(() => this.isPan = false, 30)
    };

    private onPan = (event: HammerInput) => {
        const { lastDelta, pan: { x, y }, scale } = this.state;
        const pan = {
            x: x + (lastDelta.x - event.deltaX) / scale,
            y: y + (lastDelta.y - event.deltaY) / scale
        };
        this.setState({ pan, lastDelta: { x: event.deltaX, y: event.deltaY } });
    };
}
