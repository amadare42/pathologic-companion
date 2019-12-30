import React from 'react';
import './App.css';
import { ThemeProvider } from '@material-ui/styles';
import { createThemeFromScreenSize } from './components/theme/createTheme';
import PlagueTurn from './components/hud/plagueTurn';

class App extends React.Component {

    render() {
        return <div className="App">
            <div style={ { width: '100vw', height: '100vh' } }>
                <ThemeProvider theme={ createThemeFromScreenSize({
                    width: document.body.clientWidth,
                    height: document.body.clientHeight
                }) }>
                    <PlagueTurn />
                </ThemeProvider>
            </div>
        </div>
    }
}

export default App;
