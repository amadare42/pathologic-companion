import React from 'react';
import { Container, Sprite, Stage, AppConsumer } from '@inlet/react-pixi';
import { AutoSizer } from 'react-virtualized';
import { PanZoomInput, PanZoomState } from './PanZoomInput';
import { Texture, SCALE_MODES, Application, Graphics } from 'pixi.js';
import { Point, Size } from '../model';
import { AreaKey, areaKeys } from '../data/areas';
import { delay, refs } from '../utils';
import { ReactComponent as MapMed } from '../images/polygons/pathologic_mapmed.svg'

// const DisplayObjectContainer = PixiComponent('DisplayObjectContainer', {
//     create () => new PIXI
// })

interface State {
    areas: AreaTextures | null;
}

interface Props {

}

function loadTextures() {
    return {
        map: Texture.from('/image_133med.jpg', { mipmap: true, width: 8192, height: 8192 }),
        borders: Texture.from('/borders.svg', { mipmap: false }),
        polygons: Texture.from('/polygons/pathologic_mapmed.svg', { mipmap: true, width: 8192, height: 8192 })
    }
}

interface AreaTexture {
    tex: Texture,
    point: Point,
    key: AreaKey
}

const resolutionFactor = 1;

function loadTextureFromSvgPath(path: SVGPathElement, viewBox: string, resolution: Size) {
    console.log(viewBox, resolution);
    const canvas = document.createElement('canvas');
    const m = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();

    // canvas.width = resolution.width * resolutionFactor;
    // canvas.height = resolution.height * resolutionFactor;
    canvas.width = 9070;
    canvas.height = 6200;
    canvas.setAttribute('viewBox', viewBox);

    const ctx = canvas.getContext('2d')!;
    const p = new Path2D(path.getAttribute('d')!);
    const t = m.scale(0.5);
    const p2 = new Path2D();
    p2.addPath(p, t);
    ctx.fillStyle = 'red';
    // ctx.stroke(p2);
    ctx.fill(p2);
    // document.body.appendChild(canvas);

    const tex = Texture.from(canvas, { autoSize: true, width: 9070, height: 6200 });
    canvas.remove();
    return tex;
}

type AreaTextures = { [key in AreaKey]: Texture };

async function loadAreas() {
    const areas: AreaTextures = {} as any;

    var container = document.createElement('div');
    const domParser = new window.DOMParser();
    const data = await fetch('/polygons/pathologic_maplow.svg');
    const svgDocument = domParser.parseFromString(await data.text(), 'text/xml');
    container.appendChild(svgDocument.childNodes[0]!);
    const svg = container.lastChild! as SVGSVGElement;

    // for (let a of Array.from(svg.querySelectorAll('path'))) {
    //     if (a.id !== 'area01') {
    //         a.style.fill = 'transparent';
    //     }
    // }
    //
    areas['area01'] = Texture.from('/polygons/pathologic_mapmed.svg', { autoSize: true });

    const width = svg.getAttribute('width') as any as number;
    const height = svg.getAttribute('height') as any as number;
    //
    // return {} as any;
    //
    // console.time('loading');
    // for (let areaKey of areaKeys.filter((_,idx) => idx < 10) as AreaKey[]) {
    //     let path = svg.querySelector('#' + areaKey) as SVGPathElement;
    //     if (!path) continue;
    //     let tex = loadTextureFromSvgPath(path, svg.getAttribute('viewBox')!, { width, height });
    //     areas[areaKey] = tex;
    //     // await delay(2000);
    // }
    // console.timeEnd('loading');
    return areas;
}

export class ScrollingBackground extends React.Component<Props, State> {

    state: State = {
        areas: null
    };

    containerRef = React.createRef<Container>();
    textures: ReturnType<typeof loadTextures>;

    constructor(props: Readonly<Props>) {
        super(props);
        this.textures = loadTextures();
        this.beginLoadAreas();
    }


    beginLoadAreas = async () => {
        let areas = await loadAreas();
        this.setState({ areas });
    };

    render = () => {
        return this.renderWrapped(({ width, height, scale, pan }) =>
            <Stage width={ width } height={ height } options={{
                forceCanvas: true
            }}>
                <Container pivot={ [pan.x, pan.y] } ref={ this.containerRef } scale={ scale }>
                    <Sprite texture={ this.textures.map }/>
                    {/*<Sprite texture={ this.textures.polygons } scale={ 2 } alpha={ 0.2 }/>*/ }
                    { this.renderAreas() }
                    <Sprite texture={ this.textures.borders } scale={ 2 }/>
                </Container>
            </Stage>
        );
    };

    renderAreas = () => {
        const { areas } = this.state;
        if (!areas) return null;
        var result = [];
        for (let key of Object.keys(areas) as AreaKey[]) {
            result.push(<Sprite texture={ areas[key] } scale={ 0.5 } alpha={ 0.8 } key={ key }/>)
        }
        return result;
    }

    renderWrapped = (child: (arg: PanZoomState & Size) => React.ReactNode) => (
        <AutoSizer>
            { ({ width, height }) => {
                return (
                    <PanZoomInput children={ panZoom => <div onWheel={ panZoom.onWheel } style={ { width, height } }>
                        { child({ ...panZoom, width, height }) }
                    </div> }/>);
            } }
        </AutoSizer>
    )
}
