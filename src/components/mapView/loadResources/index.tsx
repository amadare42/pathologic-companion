import React, { ReactNode } from 'react';
import { QualityPreset } from '../../../model';
import { loadResources, Resources } from './loaders';
import { withPixiApp } from '@inlet/react-pixi';

export * from './loaders';
export * from './context';

interface State {
    resources: Resources | null
}

interface Props {
    children: (resources: Resources | null) => ReactNode;
    onLoaded: (resources: Resources) => void;
    qualityPreset: QualityPreset;
    app: PIXI.Application;
}

let cachedResources: Resources | null = null;

class LoadResources extends React.Component<Props, State> {

    state: State = {
        resources: cachedResources
    };

    componentDidMount(): void {
        if (!this.state.resources) {
            this.load(this.props.qualityPreset);
        } else {
            this.props.onLoaded(this.state.resources);
        }
        (window as any)['setQ'] = this.load;
    }

    load = (q: QualityPreset) => {
        loadResources(this.props.app, q)
            .then(resources => {
                cachedResources = resources;
                this.setState({ resources });
                this.props.onLoaded(resources)
            });
    };

    render = () => {
        return this.props.children(this.state.resources);
    }
}

export default withPixiApp(LoadResources);
