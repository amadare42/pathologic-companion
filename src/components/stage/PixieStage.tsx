import React from 'react';
import { QualityPreset } from '../../model';
import LoadResources, { Resources, ResourcesContext } from '../mapView/loadResources';
import { ApplicationLoading } from '../mapView/applicationLoading';
import { Stage } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { WithSize } from './autoSizeContext';
import { PageSizes } from '../theme/createTheme';
import { inDebug } from '../../debug';

interface Props extends WithSize {
    qualityPreset: QualityPreset;
    pageSizes: PageSizes;
}

interface State {
    resources: Resources | null;
}

inDebug(() => window['PIXI'] = PIXI);

class PixieStage extends React.Component<Props, State> {

    state: State = {
        resources: null
    };

    render = () => {
        const { qualityPreset, children, size, pageSizes } = this.props;

        return <div style={ {
            height: size.height,
            width: size.width,
            maxHeight: size.height,
            top: pageSizes.top,
            position: 'absolute',
            backgroundColor: 'black'
        } }>
            { this.renderLoader() }
            <Stage width={ size.width } height={ size.height } options={{ transparent: true }} onUnmount={() => console.log('stage is killed')}>
                <LoadResources onLoaded={ this.onResourcesLoaded } qualityPreset={ qualityPreset }>
                    { (resources) => {
                        if (!resources) return null;

                        return (<ResourcesContext.Provider value={ resources }>
                            { children }
                        </ResourcesContext.Provider>)
                    } }
                </LoadResources>
            </Stage>
        </div>
    };

    private renderLoader = () => {
        const { resources } = this.state;

        if (!resources)
            return <ApplicationLoading />;

        return null;
    };

    onResourcesLoaded = (resources: Resources) => this.setState({ resources });
}

export default PixieStage;
