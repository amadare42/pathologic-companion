import React from 'react';
import { AreaData } from '../loadResources';
import { Container, Sprite } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { AREA_OVERLAY } from '../animationConstants';

interface Props {
    area: AreaData;
    app: PIXI.Application;
    visible: boolean;
}

export class AreaOverlay extends React.Component<Props> {

    private container: PIXI.Container | null = null;
    private targetAlpha: number = 0;

    constructor(props: Readonly<Props>) {
        super(props);
        this.props.app.ticker.add(this.tick);
        this.targetAlpha = props.visible ? 1 : 0;
    }

    tick = () => {
        const container = this.container;
        if (
            !container || container.alpha === this.targetAlpha
        ) return;

        const elapsedMs = this.props.app.ticker.elapsedMS;
        if (container.alpha < this.targetAlpha) {
            container.alpha += AREA_OVERLAY.fadingDelta * elapsedMs;
            if (container.alpha > 1)
                container.alpha = 1;
        } else if (container.alpha > this.targetAlpha) {
            container.alpha -= AREA_OVERLAY.fadingDelta * elapsedMs;
            if (container.alpha < 0) {
                container.alpha = 0;
                container.visible = false;
            }
        }
    };

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
        this.targetAlpha = nextProps.visible ? 1 : 0;
        if (nextProps.visible && this.container) {
            this.container.visible = true;
        }
        return false;
    }

    render = () => {
        const { area } = this.props;
        const containerName = `area_overlay_${ area.key }`;
        return <Container name={ containerName } ref={c => this.container = c as any }>
            {
                area.overlay.tiles.map(({ tex, x, y }, i) => {
                        const name = `${ containerName }_${ i }`;
                        return <Sprite scale={area.overlay.scale} texture={ tex } x={ x } y={ y } key={ name } name={ name }/>;
                    }
                )
            }
        </Container>
    }
}
