import React from 'react';

interface Props {
    children: React.ReactNode;
    onLongPressEnd?: () => void;
    onLongPressStart?: () => void;
    onClick?: () => void;
    onDown?: () => void;

    clickDelay?: number;
    longPressDelay?: number;
    deb?: string;
}

const defaultDelay = 200;
const defaultLongPressDelay = 800;

export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

class Holdable extends React.Component<Props> {

    private timerId: any = 0;
    private clickDelay: number = 0;
    private longPressDelay: number = 0;

    private holdStartTime = 0;
    private holding = false;

    constructor(props: Props) {
        super(props);
        this.setProps(props);
    }

    setProps = (props: Props) => {
        this.clickDelay = props.clickDelay || defaultDelay;
        this.longPressDelay = props.longPressDelay || defaultLongPressDelay;
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
        this.holding = false;
        this.holdStartTime = 0;
    };

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props !== prevProps) {
            this.setProps(this.props);
        }
    }

    componentWillUnmount(): void {
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
    }

    render() {
        return <div onMouseDown={ isMobile ? undefined : this.mouseDown }
                    onMouseUp={ isMobile ? undefined : this.mouseUp } onTouchStartCapture={ this.touchStart }
                    onTouchEnd={ this.touchEnd }>
            { this.props.children }
        </div>
    }

    touchStart = (ev: React.SyntheticEvent) => {
        this.holdStartTime = Date.now();
        this.holdStart();
    };

    mouseDown = (ev: React.SyntheticEvent) => {
        this.holdStart();
    };

    mouseUp = (ev: React.SyntheticEvent) => {
        this.holdEnd();
    };

    touchEnd = (ev: React.SyntheticEvent) => {
        this.holdEnd();
    };

    holdStart = () => {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = 0;
        }
        this.holdStartTime = Date.now();
        this.holding = true;
        if (this.props.onLongPressStart) {
            this.timerId = setTimeout(() => {
                this.props.onLongPressStart!();
            }, this.longPressDelay);
        }
        if (this.props.onDown) {
            this.props.onDown()
        }
    };

    holdEnd = () => {
        const holdTime = Date.now() - this.holdStartTime;
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = 0;
        }
        this.holding = false;
        if (holdTime < this.longPressDelay) {
            if (this.props.onClick)
                this.props.onClick();
        } else if (holdTime >= this.longPressDelay && this.props.onLongPressEnd) {
            this.props.onLongPressEnd();
        }
    };
}

export default Holdable;
