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
    passedTint: 0x7D5B16
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
