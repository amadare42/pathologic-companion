import React from 'react';
import { areas, AreaKey, areaKeys } from '../data/areas';
import { refs } from '../utils';
import { mapViewService } from '../MapViewService';

type OnAreaClick = (area: AreaKey) => void;

const fillColors = {
    active: '#861000',
    passed: '#7a614d',
};

const active1 = '#d9bfa866';
const active2 = '#d9bfa833';

export const GradientDefs = () => <>
    { Object.keys(fillColors).map(key => <radialGradient key={`fill-${key}`} id={`fill-${key}`}>
        <stop offset="0%" style={ { stopColor: (fillColors as any)[key] + 'ff' } }/>
        <stop offset="100%" style={ { stopColor: (fillColors as any)[key] + '00' } }/>
    </radialGradient>) };
    <radialGradient id={`fill-available`}>
        {/*<stop offset="0%" style={ { stopColor: '#d9bfa8ff' } }/>*/}
        <stop offset="0%" stopColor={active1} >
            <animate attributeName={'stop-color'} dur='600ms' values={[active1, active2, active1].join(';')} repeatCount={'indefinite'} />
            {/*<animate attributeName={'stop-color'} dur='600ms' begin={'600ms'} from={active2} to={active1} repeatCount={'indefinite'} />*/}
        </stop>
        {/*<stop offset="30%" style={ { stopColor: '#d9bfa8aa' } }/>*/}
        {/*<stop offset="80%" style={ { stopColor: '#d9bfa8aa' } }/>*/}
        {/*<stop offset="90%" style={ { stopColor: '#d9bfa800' } }/>*/}
        <stop offset="100%" style={ { stopColor: '#d9bfa800' } }/>
    </radialGradient>
    <radialGradient id={`fill-disabled`}>
        <stop offset="0%" style={ { stopColor: '#00000022' } }/>
        {/*<stop offset="40%" style={ { stopColor: '#00000044' } }/>*/}
        <stop offset="100%" style={ { stopColor: '#000000033' } }/>
        {/*<stop offset="100%" style={ { stopColor: '#00000000' } }/>*/}
    </radialGradient>
</>;

export class MaskDefs extends React.Component {

    componentDidMount(): void {
        areaKeys.forEach(k => mapViewService.initMaskRect(k));
    }

    render() {
        return <>
            { areaKeys.map(k => <mask id={ `mask_${ k }` } key={ `mask_${ k }` }/>) }
        </>
    }
}

export const AreaPolygons = ({ onAreaClick }: { onAreaClick: OnAreaClick }) => <>{
    areaKeys.map(k => <polygon
        id={ k }
        className={'area-polygon'}
        fill={ refs.fillId('disabled', 'url') }
        key={ k }
        mask={ refs.maskId(k, 'url') }
        points={ areas[k].map(p => `${ p.x },${ p.y }`).join(' ') }
        onClick={ () => onAreaClick(k as AreaKey) }/>)
} </>;
