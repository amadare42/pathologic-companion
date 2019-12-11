import React, { createRef, Ref } from 'react';
import './App.css';
import { AutoSizer } from 'react-virtualized';
import Hammer from 'react-hammerjs';
import * as d3 from 'd3';
import centroid from 'polygon-centroid';
import { allAreas, Area, AreaKey, areas } from './areas';

interface Point {
    x: number;
    y: number;
}

window.d3 = d3;


const zero = (): Point => ({ x: 0, y: 0 });

interface MapViewState {
    scale: number,
    scaleStart: number,
    pan: Point,
    lastDelta: Point,
    scaleCenter: Point,
    points: Point[],
    currentArea: AreaKey
}

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;

}

function getRectangle(points: Point[]): Rectangle {
    let minX = NaN, minY = NaN, maxX = NaN, maxY = NaN;

    for (let { x, y } of points) {
        if (isNaN(minX) || x < minX) {
            minX = x;
        }
        if (isNaN(maxX) || x > maxX) {
            maxX = x;
        }
        if (isNaN(minY) || y < minY) {
            minY = y;
        }
        if (isNaN(maxY) || y > maxY) {
            maxY = y;
        }
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

export function quadIn(t: number) {
    return t * t;
}

export function cubicOut(t: number) {
    return --t * t * t + 1;
}

interface Particle {
    href: string,
    x: number,
    y: number,
    angle: number,
}


class MapView extends React.Component<{}, MapViewState> {

    state: MapViewState = {
        scale: 1,
        scaleStart: 1,
        pan: zero(),
        lastDelta: zero(),
        scaleCenter: zero(),
        points: [],
        currentArea: "area01"
    };

    private isPan: boolean = false;
    private isZoom: boolean = false;

    svgCanvasRef = createRef<SVGSVGElement>();

    render = () => {
        const { pan, scale } = this.state;
        return <AutoSizer>
            { ({ width, height }) =>
                <Hammer options={ {
                    recognizers: {
                        pinch: { enable: true }
                    }
                } }
                        onPan={ this.onPan } onPanStart={ this.onPanStart } onPanEnd={ this.onPanEnd }
                        onPinch={ this.onPinch } onPinchStart={ this.onPinchStart } onPinchEnd={ this.onPinchEnd }>
                    <svg id={ 'rootSvg' } width={ width } height={ height } ref={ this.svgCanvasRef }
                         // onClick={this.onClick}
                         viewBox={ `${ pan.x } ${ pan.y } ${ width / scale } ${ height / scale }` }
                         onWheel={ this.onWheel }>
                        <rect id={ 'test-rect' }/>

                        <defs>
                            <radialGradient id="bones-gradient">
                                <stop offset="0%" style={ { stopColor: '#861000FF' } }/>
                                <stop offset="100%" style={ { stopColor: '#86100000' } }/>
                            </radialGradient>
                            { Object.keys(areas).map(k => <mask id={`mask_${k}`} key={`mask_${k}`} />) }
                        </defs>

                        <image href="/image_133small.jpg"/>
                        <g fill={ 'url(#bones-gradient)' }>
                            { Object.keys(areas).map(k => <polygon mask={ `url(#mask_${k})` } key={k}
                                                                   points={ allAreas[k].map(p => `${ p.x },${ p.y }`).join(' ') }
                                                                   onClick={ () => this.onAreaClick(k as AreaKey) }/>) }
                            <polygon points={ this.state.points.map(p => `${ p.x },${ p.y }`).join(' ') }/>
                        </g>
                    </svg>
                </Hammer> }
        </AutoSizer>
    };

    private onAreaClick = async (area: AreaKey) => {
        if (this.isPan || this.isZoom) return;
        this.setState({ currentArea: area });
        this.moveHands(this.state.currentArea, area);
        this.unselectArea(this.state.currentArea);
        await new Promise(r => setTimeout(r, 300));
        this.selectArea(area);
    };

    componentDidMount = async () => {
        this.selectArea(this.state.currentArea);
    };

    private onWheel = (event: React.WheelEvent) => {
        this.setState({ scale: this.state.scale - event.deltaY / 3000 });
    };


    private createHand = (sel: d3.Selection<any, any, any, any>, p: Particle) => {
        const size = 150;
        const { x, y, angle, href } = p;
        return sel.append('image')
            .attr('xlink:href', href)
            .attr('width', size)
            .attr('height', size)
            .attr('x', x)
            .attr('y', y)
            .attr('transform', `rotate(${ angle }, ${ x + size / 2 }, ${ y + size / 2 })`)
    };


    private moveHands = async (from: AreaKey, to: AreaKey) => {

        const center1 = centroid(allAreas[from]);
        const center2 = centroid(allAreas[to]);

        const animationTime = 300;
        const particlesCount = 12;
        const particleDissapearRange = 100;
        const dispersion = 100;
        const size = 150;

        const xStep = (center2.x - center1.x) / particlesCount;
        const yStep = (center2.y - center1.y) / particlesCount;

        for (let i = 0; i < particlesCount; i++) {
            const x = center1.x + xStep * i - size / 2 + getRandomInt(-dispersion, dispersion);
            const y = center1.y + yStep * i - size / 2 + getRandomInt(-dispersion, dispersion);
            const angle = getRandomInt(0, 360);
            const delay = getRandomInt(animationTime - particleDissapearRange, animationTime + particleDissapearRange);

            this.createHand(d3.select('#rootSvg'), { x, y, angle, href: '/hand_red.svg' })
                .style('opacity', 0.6)
                .transition()
                .duration(delay)
                .remove();
            await new Promise(r => setTimeout(r, animationTime / particlesCount));
        }
    };

    private selectArea = async (areaKey: AreaKey) => {
        const rect = getRectangle(allAreas[areaKey]);
        const maskSelector = `#mask_${areaKey}`;
        const animationTime = 1000;
        const particlesCount = 20;
        const particleDissapearRange = 300;
        const timePerParticle = animationTime / 2 / particlesCount;

        let maskRect: d3.Selection<SVGRectElement, unknown, HTMLElement, unknown> = d3.select(`${ maskSelector } .maskRect`);
        if (maskRect.empty()) {
            maskRect = d3.select(maskSelector)
                .append('rect');
        }

        maskRect
            .attr('x', rect.x)
            .attr('y', rect.y)
            .attr('width', rect.width)
            .attr('height', rect.height)
            .attr('fill', 'white')
            .attr('class', 'maskRect')
            .style('opacity', 0.000001)
            .transition()
            .duration(200)
            .transition()
            .duration(animationTime)
            .ease(cubicOut)
            .style('opacity', 1);

        for (let i = 0; i < particlesCount; i++) {
            const size = 150;
            const x = rect.x + rect.width / 2 + getRandomInt(-rect.width / 2, rect.width / 2) - size / 2;
            const y = rect.y + rect.height / 2 + getRandomInt(-rect.height / 2, rect.height / 2) - size / 2;
            const angle = getRandomInt(0, 360);
            const delay = getRandomInt(animationTime, animationTime + particleDissapearRange);

            this.createHand(d3.select(maskSelector), { x, y, angle, href: '/hand_black.svg'})
                .transition()
                .duration(delay)
                .remove();
            await new Promise(r => setTimeout(r, timePerParticle));
        }
    };

    private unselectArea = async (areaKey: AreaKey) => {
        const rect = getRectangle(allAreas[areaKey]);
        const maskSelector = `#mask_${areaKey}`;
        const animationTime = 1000;
        const particlesCount = 20;
        const particleDissapearRange = 100;
        const timePerParticle = animationTime / 2 / particlesCount;

        d3.select(`${ maskSelector } .maskRect`)
            .transition()
            .duration(animationTime)
            .ease(cubicOut)
            .style('opacity', 0.00001)
            .remove();

        for (let i = 0; i < particlesCount; i++) {
            const size = 150;
            const x = rect.x + rect.width / 2 + getRandomInt(-rect.width / 2, rect.width / 2) - size / 2;
            const y = rect.y + rect.height / 2 + getRandomInt(-rect.height / 2, rect.height / 2) - size / 2;
            const angle = getRandomInt(0, 360);
            const delay = getRandomInt(animationTime - particleDissapearRange, animationTime + particleDissapearRange);

            this.createHand(d3.select(maskSelector), { x, y, angle, href: '/hand_black.svg' })
                .transition()
                .duration(delay)
                .remove();
            await new Promise(r => setTimeout(r, timePerParticle));
        }
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
        this.setState({ lastDelta: { x: event.deltaX, y: event.deltaY } });
    };

    private onPanEnd = (event: HammerInput) => { setTimeout(() =>this.isPan = false, 30) };

    private onPan = (event: HammerInput) => {
        const { lastDelta, pan: { x, y }, scale } = this.state;
        const pan = {
            x: x + (lastDelta.x - event.deltaX) / scale,
            y: y + (lastDelta.y - event.deltaY) / scale
        };
        this.setState({ pan, lastDelta: { x: event.deltaX, y: event.deltaY } });
    };

}

const App: React.FC = () => {

    return (
        <div className="App">
            <div style={ { width: '100vw', height: '100vh' } }>
                <MapView/>
            </div>
        </div>
    );
};

export default App;
