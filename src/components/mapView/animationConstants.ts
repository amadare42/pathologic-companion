export const AREA = new class {
    fillTime = 1000;
    particlesCount = 60;
    fadingStart = 0.8;
    particlesTtlSpread =  0.1;

    fadingStartOn = this.fillTime * this.fadingStart;
    fadingDelta = 1 / this.fadingStartOn;
}();

export const AREA_OVERLAY = new class {
    fadeTime = 200;
    fadingDelta = 1 / this.fadeTime;
}();

export const COLORS = {
    activeTint: 0x811000,
    passedTint: 0x4A2319,

    charTints: ['#021d3f', '#D62F01', '#400000', '#ffffff']
};

export const FONTS = {
    main: 'Neucha',
    mainSize: 66,
    secondarySize: 30
};

export const SIZES = {
    UI: {
        topPanelHeightFactor: 0.17,
        buttonPanelHeightFactor: 0.14,
        panelPaddingPx: 20,

        buttonScalePc: 7,
        undoPaddingFactor: 0.04,

        topTransitionHeightPx: 166,
        bottomTransitionHeightPx: 205,
        transitionElementWidthPx: 2000,
    },

    worldWidth: 9070,
    worldHeight: 6200,
};

export const TOKENS = new class {
    fromScale = 7;
    toScale = 2;
    time = 250;

    deltaScale = (this.fromScale - this.toScale) / this.time;
    deltaAlpha = 1 / this.time;
}();

export const TEX_SIZE = {
    hand: 340
};
