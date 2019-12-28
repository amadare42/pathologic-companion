import React from "react";
import { AreaData, Resources, withResources} from '../loadResources';
import { Container, Sprite, Text } from "@inlet/react-pixi";
import { COLORS } from "../animationConstants";

interface Props {
    area: AreaData;
    resources: Resources;
    visible: boolean;
    label?: string;
}

class PassedToken extends React.Component<Props> {
    render = () => {

        const { resources, area } = this.props;
        const { tokenPosition } = area;
        const scale = 2;

        const { x, y } = tokenPosition;

        return <Container visible={ true } x={x} y={y}>
            <Sprite texture={ resources.whiteHand } anchor={ 0.5 } scale={ scale }/>
            { this.renderLabel() }
        </Container>
    }

    renderLabel = () => {
        const { label } = this.props;

        if (!label) return null;
        return <Text text={ label } style={ {
            fontSize: '340px',
            fill: COLORS.activeTint,
            fontFamily: 'cursive',
            align: 'center',
            dropShadow: true,
            dropShadowDistance: 0,
            dropShadowBlur: 25,
        } }/>
    }
}

export default withResources(PassedToken);
