export const timings = new class {
    cardRealign = 0.6;
    destruction = 1;
    birdsFlyOff = 1.2;
    destructionTotal = this.cardRealign + this.destruction;

    mod = (val: keyof typeof timings, mod: '+' | '-' = '-') => {
        return `${mod}=${this[val]}`;
    }
}();
