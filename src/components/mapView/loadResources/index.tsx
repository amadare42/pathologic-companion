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

class LoadResources extends React.Component<Props, State> {

    state: State = { resources: null };

    componentDidMount(): void {
        this.load(this.props.qualityPreset);
        (window as any)['setQ'] = this.load;
    }

    load = (q: QualityPreset) => {
        loadResources(this.props.app, q)
            .then(resources => {
                this.setState({ resources });
                this.props.onLoaded(resources)
            });
    };

    render = () => {
        return this.props.children(this.state.resources);
    }
}

export default withPixiApp(LoadResources);
