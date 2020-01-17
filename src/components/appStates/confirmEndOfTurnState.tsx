import { BaseAppState, RouteProps } from './appState';
import { UiProps } from '../hud/uiScreen';
import { strings } from '../locale/strings';
import Button from '../hud/button/button';
import React from 'react';
import { MapSnapshot } from '../../model';

interface Props {
    onTurnEnd: () => void,
    mapSnapshot: MapSnapshot
}

export class ConfirmEndOfTurnState extends BaseAppState<{}> {

    constructor(routeProps: RouteProps, private props: Props) {
        super(routeProps, {});
    }

    renderProps(): UiProps {

        return {
            msg: strings.confirmTurnEnd(),
            msgAccented: true,
            bottomButtons: () => (<>
                <Button iconHref={'icons/checkmark.png'} onClick={() => {
                    this.routeProps.popState();
                    this.props.onTurnEnd();
                } } />
                <Button iconHref={'icons/cross.png'} onClick={() => this.routeProps.popState() } />
            </>),
            onMapBottomButtons: () => null,
            mapSnapshot: {
                ...this.props.mapSnapshot,
                grayscale: true
            }
        };
    }
}
