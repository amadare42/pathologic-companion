export const timings = new class {
    cardRealing = 0.6;
    destruction = 1;
    destructionTotal = this.cardRealing + this.destruction;

    mod = (val: keyof typeof timings, mod: '+' | '-' = '-') => {
        return `${mod}${this[val]}`;
    }
}();
