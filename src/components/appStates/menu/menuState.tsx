import { UiProps } from '../../hud/uiScreen';
import React from 'react';
import { BaseAppState, RouteProps } from '../appState';
import { strings } from '../../locale/strings';
import { PersistenceService } from '../../../core/persistenceService';
import { SelectStartingAreaState } from '../selectStartingAreaState';
import Button from '../../hud/button/button';
import { urlSerializer } from '../../../core/gameActionsUrlSerializer';
import { RestoreAppState } from '../restoreAppState';

export class MenuState extends BaseAppState<{}> {

    constructor(routeProps: RouteProps, private persistenceService: PersistenceService) {
        super(routeProps, {});
    }

    renderProps(): UiProps {
        return {
            customComponent: pageSizes => {
                return this.renderMenuModal();
            }
        }
    }

    renderMenuModal = () => {
        return <div style={ {
            position: 'absolute',
            zIndex: 300,
            width: '100%',
            height: '100%',
            backgroundColor: '#00000066'
        } }>
            <div style={ {
                position: 'absolute',
                width: '50vmax',
                height: '70vh',
                backgroundColor: '#000000',
                border: '1px solid red',
                left: 'calc(50% - 25vmax)',
                top: '17.5vh',
            } }>
                <div style={{
                    // marginBottom: '2vh',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <Button iconHref={'icons/cross.png'}
                            onClick={() => this.routeProps.popState()}
                            styles={{ padding: '1vh' }}
                    />
                </div>

                <div onClick={ this.onNewGame } style={ {
                    color: 'white',
                    fontSize: '6vh',
                    paddingTop: '2vh'
                } }>{ strings.startNew() }</div>
                <div onClick={ this.onSaveGameReplay } style={ {
                    color: 'white',
                    fontSize: '6vh',
                    paddingTop: '2vh'
                } }>{ strings.saveGameReplay() }</div>
                <div onClick={ this.onReturnToGame } style={ {
                    color: 'white',
                    fontSize: '6vh',
                    paddingTop: '2vh'
                } }>{ strings.returnToGame() }</div>

                {/*<div onClick={ this.onNewGame } style={ {*/}
                {/*    color: 'white',*/}
                {/*    fontSize: '6vh',*/}
                {/*    paddingTop: '1vh'*/}
                {/*} }>{ strings.restoreLastGame() }</div>*/}
            </div>
        </div>
    };

    onNewGame = () => {
        this.persistenceService.writeAll([]);
        this.routeProps.clearAll();
        const url = new URLSearchParams(document.location.search);
        url.delete('r');
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + url.toString();
        window.history.replaceState(null, '', newurl);
        setTimeout(() => this.routeProps.pushState(new SelectStartingAreaState(this.routeProps)), 0);
    }

    onSaveGameReplay = async () => {
        const url = new URLSearchParams('');
        const actions = await this.persistenceService.getAll();
        if (!actions) {
            return;
        }
        url.append('r', urlSerializer.serialize(actions.map(a => a.action)));

        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + url.toString();
        prompt('', newurl);
    }

    onReturnToGame = () => {
        this.routeProps.clearAll();
        const url = new URLSearchParams(document.location.search);
        url.delete('r');
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + url.toString();
        window.history.replaceState(null, '', newurl);
        setTimeout(() => this.routeProps.pushState(new RestoreAppState(this.routeProps)), 0);
    }
}



