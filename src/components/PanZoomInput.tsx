import React from 'react';
import { Point } from '../model';
import Hammer from 'react-hammerjs';
import { zero } from '../utils';

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
    velMan = new VelocityMan();

    state: State = {
        scale: 0.2,
        scaleStart: 1,
        lastDelta: { x: 0, y: 0 },
        pan: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 }
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
            lastDelta: { x: event.deltaX, y: event.deltaY },
            velocity: zero()
        });
    };

    private onPanEnd = (event: HammerInput) => {
        this.velMan.set({ x: event.velocityX, y: event.velocityY }, (v) => {
            console.log(v.x, v.y);
            this.setState({
                pan: {
                    x: this.state.pan.x - v.x,
                    y: this.state.pan.y - v.y
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

class VelocityMan {

    currentVel: Point = zero();
    cb: (p: Point) => void = () => {};
    tickNo: number = 0;
    ticksCount = 20;

    set(velocity: Point, cb: (p: Point) => void) {
        this.tickNo = 0;
        this.currentVel = velocity;
        this.tick();
        this.cb = cb;
    }

    tick = () => {
        this.tickNo++;
        this.quadOut(this.tickNo);
        var velocity = {
            x: this.reduceVelocity(this.currentVel.x),
            y: this.reduceVelocity(this.currentVel.y),
        };
        this.cb(velocity);
        if (this.tickNo < this.ticksCount) {
            setTimeout(this.tick, 16);
        }
    };

    private reduceVelocity = (val: number) => {
        const deadZone = 0.01;
        const absVal = Math.abs(val);
        if (Math.abs(val) <= deadZone) return 0;
        const mod = this.quadOut(this.tickNo /this.ticksCount) * val;
        if (Math.abs(mod) >= absVal) {
            return 0;
        }
        if (val > 0) {
            return val - mod;
        } else {
            return val + mod;
        }
    };

    quadOut(t: number) {
        return t * (2 - t);
    }
}