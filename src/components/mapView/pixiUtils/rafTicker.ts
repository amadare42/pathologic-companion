
export interface RafTimestamp {
    timestamp: number, elapsedTotal: number, elapsed: number
}

export class RafTicker {

    private startTime: number = 0;
    private lastTick: number = 0;
    private elapsedTotal: number = 0;
    private rafHandle: number = 0;
    private isStopped: boolean = true;

    constructor(private onTick: (state: RafTimestamp) => boolean) {
    }

    start() {
        this.isStopped = false;
        this.startTime = Date.now();
        this.elapsedTotal = 0;
        this.lastTick = 0;
        requestAnimationFrame(this.tick)
    }

    stop() {
        this.isStopped = true;
        if (this.rafHandle) {
            cancelAnimationFrame(this.rafHandle);
        }
    }

    private tick = (timestamp: number) => {
        if (this.isStopped) return;
        if (this.lastTick === 0) {
            this.lastTick = timestamp;
        }
        const elapsed = timestamp - this.lastTick;
        this.elapsedTotal += elapsed;
        this.lastTick = timestamp;
        if (this.onTick({ elapsed, elapsedTotal: this.elapsedTotal, timestamp })) {
            requestAnimationFrame(this.tick);
        }
    }
}
