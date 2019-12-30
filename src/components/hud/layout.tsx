import React, { Component } from 'react';
import { createThemeFromScreenSize, Theme } from '../theme/createTheme';
import { AutoSizer, Size } from 'react-virtualized';
import { ThemeProvider } from '@material-ui/styles';

interface Props {
    children: (theme: Theme) => React.ReactNode;
}

class Layout extends Component<Props> {

    private theme?: Theme;

    private getTheme = (size: Size) => {
        if (!this.theme) {
            return this.theme = createThemeFromScreenSize(size);
        }
        if (this.theme.pageSizes.viewport.height === size.height && this.theme.pageSizes.viewport.width === size.width) {
            return this.theme;
        }
        return this.theme = createThemeFromScreenSize(size);
    };

    render() {
        return <div style={ { width: '100vw', height: '100vh' } }><AutoSizer>
            { (size) => {
                const theme = this.getTheme(size);
                return <ThemeProvider theme={ theme }>
                    { this.props.children(theme) }
                </ThemeProvider>
            } }
        </AutoSizer>
        </div>
    }
}

export default Layout;
