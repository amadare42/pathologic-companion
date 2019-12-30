// import React, { Component } from 'react';
// import MixedMediaModal, { ModalRenderer } from './modal/mixedMediaModal';
// import Layout from './layout';
// import { AreaTransition } from '../../model';
// import TopPanel from './topPanel/topPanel';
// import { PageSizes, Theme } from '../theme/createTheme';
// import PixieStage from '../stage/PixieStage';
// import MapView from '../mapView/mapView';
// import BottomPanel from './bottomPanel/bottomPanel';
//
// interface Props {
// }
// interface State {
//     isModalVisible: boolean;
//     msg: string | null;
//     mainMsg: string | null;
// }
//
// class UiScreen extends Component<Props, State> {
//
//     state: State = {
//         isModalVisible: false,
//         mainMsg: '',
//         msg: ''
//     };
//
//     render() {
//         return <Layout>
//             { (theme) => {
//                 return <MixedMediaModal pageSizes={ theme.pageSizes } isVisible={ this.state.isModalVisible }>
//                     {
//                         (modal) => (<>
//                             { this.renderTopPanel() }
//                             { this.renderStage(theme, modal) }
//                             { modal.renderModal() }
//                             { this.renderBottomPanel(theme.pageSizes) }
//                         </>)
//                     }
//                 </MixedMediaModal>
//             } }
//         </Layout>
//     }
//
//     private renderTopPanel = () => <TopPanel turn={ this.state.mainMsg } text={ this.state.msg }/>;
//
//     private renderStage = ({ pageSizes }: Theme, modalRenderer: ModalRenderer) => {
//         const middleSize = {
//             width: pageSizes.viewport.width,
//             height: pageSizes.middle
//         };
//
//         return <PixieStage size={ middleSize } pageSizes={ pageSizes } qualityPreset={ 'med' }>
//             <MapView size={ middleSize }
//                      mapSnapshot={ this.getMapSnapshot() }
//                      onAreaClick={ this.onAreaClick }/>
//             { modalRenderer.renderPixiBackdrop() }
//         </PixieStage>
//     };
//
//     private renderBottomPanel = (pageSizes: PageSizes) => <BottomPanel pageSizes={ pageSizes }
//                                                                        onContaminate={ this.onContaminate }
//                                                                        onEndTurn={ this.onTurnEnd }
//                                                                        onSiege={ this.onSiege }
//                                                                        onUndo={ this.onUndo }
//                                                                        undoVisible={ !!this.state.game.turnActions.length }
//     />;
// }
//
// export default UiScreen;
