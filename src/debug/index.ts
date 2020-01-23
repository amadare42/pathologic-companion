import * as dat from 'dat.gui';

export const isDebug = localStorage.getItem('debug');

const gui: dat.GUI = isDebug ? new dat.GUI() : {} as any;
export const inDebug = <T>(action: (gui: dat.GUI) => T): T => {
    if (isDebug) return action(gui);
    return {} as any;
};

inDebug(() => {
    gui.domElement.parentElement!.style.zIndex = '9999999999';
    if (localStorage.getItem('debug_show') == 'false') {
        gui.hide();
    }
    setInterval(() => {
        localStorage.setItem('debug_show', (gui.domElement.style.display !== 'none').toString());
    }, 250);
});
