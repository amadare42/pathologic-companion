import React from 'react';
import { Point } from '../model';
import Hammer from 'react-hammerjs';

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
}

export class PanZoomInput extends React.Component<Props, State> {
    isZoom = false;
    isPan = false;

    state: State = {
        scale: 0.2,
        scaleStart: 1,
        lastDelta: { x: 0, y: 0 },
        pan: { x: 0, y: 0 }
    };

    render = () => {

        const { children } = this.props;
        const { pan, scale } = this.state;

        const options = {
            recognizers: {
                pinch: { enable: true }
            }
        };
        return <Hammer options={ options }
                       onPan={ this.onPan } onPanStart={ this.onPanStart } onPanEnd={ this.onPanEnd }
                       onPinch={ this.onPinch } onPinchStart={ this.onPinchStart } onPinchEnd={ this.onPinchEnd }>
            { children({
                isPanning: this.isPan,
                isScaling: this.isZoom,
                pan,
                scale,
                onWheel: this.onWheel
            }) }
        </Hammer>;
    };

    private onWheel = (event: React.WheelEvent) => {
        this.setState({ scale: this.state.scale - event.deltaY / 3000 });
    };

    private onPinch = (event: HammerInput) => {
        this.setState({
            scale: this.state.scaleStart * event.scale,
        });
    };

    private onPinchEnd = (event: HammerInput) => {
        // this.isZoom = false;
        // this.setState({
        //     scaleStart: this.state.scale
        // })
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
