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
import { ModalController } from './modal/modalController';

export interface UiProps {
    msg?: string | null;

    mainMsg?: string | null;
    msgAccented?: boolean;

    bottomButtons?: () => React.ReactNode;
    onMapBottomButtons?: () => React.ReactNode;
    onMapTopButtons?: () => React.ReactNode;
    mapSnapshot?: MapSnapshot | null;

    onAreaClick?: (key: AreaKey) => void;
    modalController?: ModalController | null;

    onMenuClick?: () => void;

    customComponent?: (pageSizes: PageSizes) => React.ReactNode | void;
}

class UiScreen extends Component<UiProps> {

    render() {
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
                            { this.renderOnMapTopButtons(theme.pageSizes) }
                            { this.props.customComponent?.(theme.pageSizes) || undefined }
                        </>)
                    }
                </MixedMediaModal>
            } }
        </Layout>
    }

    private renderOnMapTopButtons = (pageSizes: PageSizes) => {
        if (!this.props.onMapTopButtons) return null;

        return <div style={{ position: 'absolute', right: '10vw', zIndex: 200, top: ~~(pageSizes.viewport.height * 0.04 + pageSizes.top) }}>
            { this.props.onMapTopButtons() }
        </div>
    };

    private renderTopPanel = () => <TopPanel
        main={ this.props.mainMsg }
        onMenuClick={ this.props.onMenuClick }
        msgAccented={ this.props.msgAccented }
        secondary={ this.props.msg }/>;

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
                                                                       onMapButtons={ this.props.onMapBottomButtons }
    />;
}

export default UiScreen;
