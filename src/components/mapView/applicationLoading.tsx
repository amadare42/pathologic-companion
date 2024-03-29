import React from 'react';
import { strings } from '../locale/strings';

export const ApplicationLoading = () => <div
    style={ { width: '100vw', height: '100vh', color: 'white', backgroundColor: 'black', fontSize: '75px', paddingTop: '200px' } }>
    <div style={ { display: 'flex', justifyContent: 'center', marginBottom: '2vh' } }>
        <img src={ 'icons/menu_button.png' } id={ 'loading' }/>
    </div>
    <div>{ strings.loading() }</div>
</div>;
