import * as dat from 'dat.gui';

export const isDebug = localStorage.getItem('debug');

const gui = isDebug ? new dat.GUI() : {} as any;
export const inDebug = (action: (gui: dat.GUI) => void) => {
    if (isDebug) action(gui)
};

inDebug(() => {
    const style = document.createElement('style');
    style.innerHTML = '.dg.ac { z-index: 9999999999 }';
    document.head.appendChild(style);
});
