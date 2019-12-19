import { Point } from '../../../model';
import { zero } from '../../../utils';

export class InertialVelocityService {

    currentVel: Point = zero();
    cb: (p: Point) => void = () => {
    };
    startTime: number = 0;
    frictionForce: number = 0.01;
    isStopped = false;

    set(velocity: Point, cb: (p: Point) => void) {
        this.startTime = Date.now();
        this.currentVel = velocity;
        this.isStopped = false;
        this.tick();
        this.cb = cb;
    }

    stop() {
        this.isStopped = true;
    }

    tick = () => {
        if (this.isStopped) return;
        const delta = Date.now() - this.startTime;
        const velocity = {
            x: this.reduceVelocity(this.currentVel.x, delta),
            y: this.reduceVelocity(this.currentVel.y, delta),
        };
        this.cb(velocity);
        if (velocity.x !== 0 || velocity.y !== 0) {
            setTimeout(this.tick, 10);
        }
    };

    private reduceVelocity = (val: number, delta: number) => {
        const absVal = Math.abs(val);
        const mod = this.quadIn(delta) * this.frictionForce;
        if (Math.abs(mod) >= absVal) {
            return 0;
        }
        if (val > 0) {
            return val - mod;
        } else {
            return val + mod;
        }
    };

    quadIn(t: number) {
        return t;
    }

    quadOut(t: number) {
        return t * (2 - t);
    }
}
