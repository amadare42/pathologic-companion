import * as React from 'react'
import { Component } from 'react'
import fitty, { Options, Fitted } from 'fitty'

export type Props = Partial<Options> & { text?: string } & React.AllHTMLAttributes<HTMLSpanElement>

export const style = {
    display: `inline-block`,
    whiteSpace: `nowrap`
};

export class TextFit extends Component<Props> {
    element: HTMLElement = null as any;
    thing: Fitted = null as any;
    fitted: boolean = false;
    initialized: boolean = false;

    componentDidMount() {
        this.fit()
    };

    componentDidUpdate() {
        this.fit()
    };

    componentWillReceiveProps(nextProps: Props) {
        if
        (nextProps.children !== this.props.children
            || nextProps.minSize !== this.props.minSize
            || nextProps.maxSize !== this.props.maxSize
            || nextProps.multiLine !== this.props.multiLine
        ) {
            this.fitted = false
        }
    }

    componentWillUnmount() {
        this.thing.unsubscribe()
    }

    fit() {
        if (this.fitted) {
            return
        }
        if (!this.initialized) {
            this.thing = fitty(this.element) as any;
        } else {
            this.thing.fit()
        }
        this.fitted = true;
        this.initialized = true;
    }

    makeRef = (el: HTMLElement) => {
        this.element = el
    }

    render() {
        const { makeRef: ref } = this;
        const { children, text, ...rest } = this.props;
        const props = { style, ref };
        return (
            <div { ...rest }>
                <span { ...(props as any) }>{ text }{ children }</span>
            </div>
        )
    }
}
