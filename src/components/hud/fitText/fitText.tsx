import React, { Component } from 'react';
import * as _ from 'lodash';
import { delay } from '../../../utils';

type LimitType = 'vw' | 'vh' | 'px';

interface Limit {
    type: LimitType;
    value: number;
}

interface Props {
    children: string;
    lines: number;
    maxHeight: Limit;
    maxWidth: Limit;
}

class FitText extends Component<Props> {

    private ref = React.createRef<HTMLDivElement>();
    private debouncedResize: () => void;

    constructor(props: Props) {
        super(props);
        this.debouncedResize = _.debounce(this.recalculate, 200);
    }

    componentDidMount(): void {
        window.addEventListener('resize', this.debouncedResize);
        this.recalculate();
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.debouncedResize);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.children !== prevProps.children) {
            this.recalculate();
        }
    }

    render() {
        return <div ref={this.ref}>
            { this.props.children }
        </div>
    }

    recalculate = async () => {
        if (!this.ref.current) {
            return;
        }
        const initialSizes = this.getBodySizeSnapshot();
        const maxWidthPx = this.calcLimit(this.props.maxWidth);
        const maxHeightPx = this.calcLimit(this.props.maxHeight);

        let currentSize = (maxHeightPx / this.props.lines) - 1;
        this.setSize(currentSize);
        this.ref.current.style.lineHeight = ~~(this.calcLimit(this.props.maxHeight) / this.props.lines) + 'px';
        await delay(0);
        let dims = this.getDims();
        while (dims.width > maxWidthPx || dims.height > maxHeightPx) {
            this.setSize(--currentSize);
            await delay(0);
            if (initialSizes !== this.getBodySizeSnapshot()) {
                await this.recalculate();
                return;
            }
            dims = this.getDims();
        }
    };

    getBodySizeSnapshot = () => `${document.body.clientWidth}, ${document.body.clientHeight}`;

    setSize = (size: number) => {
        if (!this.ref.current) {
            return;
        }
        const element = this.ref.current;

        element.style.fontSize = size + 'px';
    };

    getDims = () => {
        if (!this.ref.current) {
            return { width: 0, height: 0 };
        }
        const element = this.ref.current;
        return {
            width: element.scrollWidth,
            height: element.scrollHeight
        }
    };

    calcLimit = (limit: Limit) => {
        switch (limit.type) {
            case 'px': return limit.value;
            case 'vh': return document.body.clientHeight * limit.value * 0.01;
            case 'vw': return document.body.clientWidth * limit.value * 0.01;
        }
        return limit.value;
    };
}

export default FitText;
