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

    containerRef = React.createRef<HTMLDivElement>();

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
                    onTouchEnd={ this.touchEnd } ref={this.containerRef}>
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

    mouseUp = (ev: React.MouseEvent) => {
        this.holdEnd(ev);
    };

    touchEnd = (ev: React.TouchEvent) => {
        this.holdEnd(ev);
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

    holdEnd = (ev: React.MouseEvent | React.TouchEvent) => {
        const holdTime = Date.now() - this.holdStartTime;
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = 0;
        }
        try {
            if (holdTime < this.longPressDelay) {
                if (this.props.onClick && this.holding && this.isWithin(ev))
                    this.props.onClick();
            } else if (holdTime >= this.longPressDelay && this.props.onLongPressEnd) {
                this.props.onLongPressEnd();
            }
        } finally {
            this.holding = false;
        }
    };

    isWithin = (ev: React.MouseEvent | React.TouchEvent) => {
        let rect = this.containerRef.current!.getBoundingClientRect();
        let x, y = 0;
        if ('touches' in ev) {
            x = ev.changedTouches[0].clientX;
            y = ev.changedTouches[0].clientY;
        } else {
            x = ev.clientX;
            y = ev.clientY;
        }
        return (rect.x <= x && x <= rect.x + rect.width)
            && (rect.y <= y && y <= rect.y + rect.height);
    }
}

export default Holdable;
