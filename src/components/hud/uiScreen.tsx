import React, { Component } from 'react';
import MixedMediaModal, { ModalRenderer } from './modal/mixedMediaModal';
import Layout from './layout';
import TopPanel from './topPanel/topPanel';
import { PageSizes, Theme } from '../theme/createTheme';
import PixieStage from '../stage/PixieStage';
import MapView from '../mapView/mapView';
import BottomPanel from './bottomPanel/bottomPanel';
import { MapSnapshot } from '../../model';
import { AreaKey } from '../../data/areas';
import { Character } from '../../data/characters';
import { ModalController } from './modal/modalController';

export interface UiProps {
    msg?: string | null;
    mainMsg?: string | null;

    undoVisible?: boolean;
    bottomButtons?: () => React.ReactNode;
    mapSnapshot?: MapSnapshot;

    onAreaClick?: (key: AreaKey) => void;
    onUndo?: () => void;
    modalController?: ModalController;
}

class UiScreen extends Component<UiProps> {

    constructor(props: any) {
        super(props);
        console.log('ctor', this.props);
    }

    componentWillUnmount(): void {
        console.log('unmounted!');
    }

    render() {
        console.log('render ui', this.props);
        return <Layout>
            { (theme) => {
                return <MixedMediaModal controller={this.props.modalController}
                                        pageSizes={ theme.pageSizes }>
                    {
                        (modal) => (<>
                            { this.renderTopPanel() }
                            { this.renderStage(theme, modal) }
                            { modal.renderModal() }
                            { this.renderBottomPanel(theme.pageSizes) }
                        </>)
                    }
                </MixedMediaModal>
            } }
        </Layout>
    }

    private renderTopPanel = () => <TopPanel main={ this.props.mainMsg } secondary={ this.props.msg }/>;

    private renderStage = ({ pageSizes }: Theme, modalRenderer: ModalRenderer) => {
        const middleSize = {
            width: pageSizes.viewport.width,
            height: pageSizes.middle
        };

        return <PixieStage key={'pixiStage'} size={ middleSize } pageSizes={ pageSizes } qualityPreset={ 'med' }>
            <MapView size={ middleSize }
                     mapSnapshot={ this.props.mapSnapshot }
                     onAreaClick={ this.props.onAreaClick }/>
            { modalRenderer.renderPixiBackdrop() }
        </PixieStage>
    };

    private renderBottomPanel = (pageSizes: PageSizes) => <BottomPanel pageSizes={ pageSizes }
                                                                       buttons={ this.props.bottomButtons }
                                                                       onUndo={ this.props.onUndo }
                                                                       undoVisible={ !!this.props.undoVisible }
    />;
}

export default UiScreen;
