import * as dat from 'dat.gui';

export const isDebug = localStorage.getItem('debug');

const gui: dat.GUI = isDebug ? new dat.GUI() : {} as any;
export const inDebug = <T>(action: (gui: dat.GUI) => T): T => {
    if (isDebug) return action(gui);
    return {} as any;
};

inDebug(() => {
    gui.domElement.style.zIndex = '9999999999';
});
