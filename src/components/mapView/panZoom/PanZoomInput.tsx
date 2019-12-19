import React from 'react';
import { Point } from '../../../model';
import Hammer from 'react-hammerjs';
import { zero } from '../../../utils';
import { InertialVelocityService } from './inertialVelocityService';

export interface PanZoomState {
    isPanning: boolean;
    isScaling: boolean;
    scale: number;
    pan: Point;
}

interface Props {
    children: (state: PanZoomState & {onWheel: (event: React.WheelEvent) => void}) => React.ReactNode;
}

interface State {
    scale: number;
    scaleStart: number;
    lastDelta: Point;
    pan: Point;
    velocity: Point;
}

export class PanZoomInput extends React.Component<Props, State> {
    isZoom = false;
    isPan = false;
    velocityService = new InertialVelocityService();
    hammerRef = React.createRef<any>();

    state: State = {
        scale: 0.2,
        scaleStart: 1,
        lastDelta: { x: 0, y: 0 },
        pan: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 }
    };

    componentDidMount(): void {
        var domElement = this.hammerRef.current!.domElement as HTMLDivElement;
        domElement.addEventListener('mousedown', this.touchStart);
        domElement.addEventListener('touchstart', this.touchStart);
    }

    componentWillUnmount(): void {
        var domElement = this.hammerRef.current!.domElement as HTMLDivElement;
        domElement.removeEventListener('mousedown', this.touchStart);
        domElement.removeEventListener('touchstart', this.touchStart);
    }

    render = () => {
        const options = {
            recognizers: {
                pinch: { enable: true },

            }
        };
        return <Hammer options={ options }
                       ref={ this.hammerRef }
                       onPan={ this.onPan } onPanStart={ this.onPanStart } onPanEnd={ this.onPanEnd }
                       onPinch={ this.onPinch } onPinchStart={ this.onPinchStart } onPinchEnd={ this.onPinchEnd }>
            { this.renderChildren() }
        </Hammer>;
    };

    private touchStart = () => {
        this.velocityService.stop();
    };

    private renderChildren = () => {
        const { children } = this.props;
        const { pan, scale } = this.state;

        return children({
            isPanning: this.isPan,
            isScaling: this.isZoom,
            pan,
            scale,
            onWheel: this.onWheel
        });
    }

    private onWheel = (event: React.WheelEvent) => {
        this.setState({ scale: this.state.scale - event.deltaY / 3000 });
    };

    private onPinch = (event: HammerInput) => {
        this.setState({
            scale: this.state.scaleStart * event.scale,
        });
    };

    private onPinchEnd = (event: HammerInput) => {
        this.isZoom = false;
        // this.setState({
        //     scaleStart: this.state.scale
        // })
    };

    private onPinchStart = (event: HammerInput) => {
        this.isZoom = true;
    };

    private onPanStart = (event: HammerInput) => {
        this.isPan = true;
        this.velocityService.stop();
        this.setState({
            lastDelta: { x: event.deltaX, y: event.deltaY },
            velocity: zero()
        });
    };

    private onPanEnd = (event: HammerInput) => {
        this.velocityService.set({ x: event.velocityX, y: event.velocityY }, (v) => {
            // console.log(v.x, v.y);
            this.setState({
                pan: {
                    x: this.state.pan.x - v.x * 3,
                    y: this.state.pan.y - v.y * 3
                }
            })
        });
        // TODO: find better way to prevent tap on pan end
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
