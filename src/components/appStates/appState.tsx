import { UiProps } from '../hud/uiScreen';

export interface RouteProps {
    pushState: (state: AppState) => void;
    popState: () => void;
    update: () => void;
}

export interface AppState {
    renderProps(): UiProps;
}

export abstract class BaseAppState<InternalState extends { [key: string]: any }> implements AppState {

    protected constructor(protected stateman: RouteProps, protected state: InternalState) {
    }

    abstract renderProps(): UiProps;

    protected setState = (state: Partial<InternalState>) => {
        let wasUpdated = false;
        for (let key of Object.keys(state)) {
            const value = state[key]!;
            if (this.state[key] != value) {
                (this.state[key] as any) = value;
                wasUpdated = true;
            }
        }
        if (wasUpdated) {
            this.stateman.update();
        }
    }
}


