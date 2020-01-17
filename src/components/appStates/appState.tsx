import { UiProps } from '../hud/uiScreen';

export interface Transition {
    renderProps(): UiProps;
    promise: Promise<Transition>;
}

export class SimpleTransition implements Transition {

    promise: Promise<Transition>;

    renderProps(): UiProps {
        return this.props;
    }

    constructor(private props: UiProps, promise: Promise<any>) {
        this.promise = promise.then(() => this);
    }
}

export interface RouteProps {
    pushState: (state: AppState, transition?: Transition) => void;
    popState: (transition?: Transition) => void;
    update: () => void;

    pushMessage: (msg: string, timeout?: number) => void;
}

export interface AppStateMessage {
    data?: any;
    type: string;
    meta?: any;
}

export interface AppState {
    renderProps(): UiProps;
    handleMessage?(msg: AppStateMessage): void;
}

export abstract class BaseAppState<InternalState extends { [key: string]: any }> implements AppState {

    protected constructor(
        protected routeProps: RouteProps,
        protected state: InternalState
    ) {
    }

    abstract renderProps(): UiProps;

    protected update = () => this.routeProps.update();

    protected setState(state: Partial<InternalState>) {
        let wasUpdated = false;
        for (let key of Object.keys(state)) {
            const value = state[key]!;
            if (this.state[key] !== value) {
                (this.state[key] as any) = value;
                wasUpdated = true;
            }
        }
        if (wasUpdated) {
            this.routeProps.update();
        }
    }
}


