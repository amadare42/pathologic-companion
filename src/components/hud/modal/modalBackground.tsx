import React, { Component } from 'react';
import { Point, Rectangle } from '../../../model';
import { WithResources, withResources } from '../../mapView/loadResources';
import { Container, withPixiApp } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import { getRandomBool, getRandomInt } from '../../../utils';
import { Theme } from '../../theme/createTheme';

interface Props extends WithResources {
    rect: Rectangle;
    pageSizes: Theme['pageSizes'];
    app: PIXI.Application;
    isVisible: boolean;
}

interface CrowSprite {
    start: Point;
    speed: Point,
    target: Point,
    sprite: PIXI.AnimatedSprite;
    isLeft: boolean;
    isTop: boolean;
    done: {
        x: boolean,
        y: boolean
    }
}

class ModalBackground extends Component<Props> {

    private crows: CrowSprite[] = [];
    private container: PIXI.Container = null as any;

    constructor(props: Props) {
        super(props);
        props.app.ticker.add(this.tick);
    }

    componentDidMount(): void {
        if (this.props.isVisible) {
            this.start();
        }
    }

    componentWillUnmount(): void {
        this.props.app.ticker.remove(this.tick);
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
        if (!nextProps.isVisible && this.props.isVisible) {
            this.reverseSprites();
        }
        if (nextProps.isVisible && !this.props.isVisible) {
            this.start();
        }
        if (nextProps.isVisible && nextProps.rect.x !== this.props.rect.x) {
            this.start();
        }
        return false;
    }

    private reverseSprites = () => {
        this.crows.forEach(c => {
            const oldStart = c.start;
            c.start = c.target;
            c.target = oldStart;
            c.isTop = !c.isTop;
            c.isLeft = !c.isLeft;
            c.done = {
                x: false,
                y: false
            };
            c.sprite.gotoAndPlay(getRandomInt(0, 10));
            c.sprite.scale.set(-c.sprite.scale.x);
            c.sprite.angle = c.sprite.angle - 180;
            const arriveDelay = getRandomInt(50, 150);
            c.speed = {
                x: ((c.target.x - c.start.x) / arriveDelay),
                y: ((c.target.y - c.start.y) / arriveDelay)
            };
        });
    };

    start = () => {
        const { rect } = this.props;
        if (this.crows.length) {
            // TODO: realign
            this.crows.forEach(c => c.sprite.destroy());
            this.crows = [];
        }

        const factor = 25;
        const xCount = rect.width / factor;
        const yCount = rect.height / factor;
        const rnd = () => getRandomInt(-25, 25);

        for (let x = 0; x < xCount; x++) {
            for (let y = 0; y < yCount; y++) {
                const sprite = this.createSprite({
                    x: rect.x + factor * x + rnd(),
                    y: rect.y + factor * y + rnd(),
                });
                this.crows.push(sprite);
            }
        }
    };

    private createSprite = (target: Point): CrowSprite => {

        const { viewport } = this.props.pageSizes;

        const isLeft = getRandomBool();
        const isTop = getRandomBool();
        const scale = getRandomInt(5, 10) / 10;

        let start = {
            x: isLeft ? getRandomInt(-300, 0) : getRandomInt(viewport.width, viewport.width + 300),
            y: isTop ? getRandomInt(-300, 0) : getRandomInt(viewport.height, viewport.height + 300),
        };
        var arriveDelay = getRandomInt(80, 120);
        const sprite = new PIXI.AnimatedSprite(this.props.resources.crows);
        sprite.x = start.x;
        sprite.y = start.y;
        sprite.anchor.set(0.5);
        sprite.scale.set(scale, scale)
        sprite.animationSpeed = getRandomInt(5, 10) / 10;
        sprite.angle = getRandomInt(0, 30);
        sprite.gotoAndPlay(getRandomInt(0, 10));
        if (!isLeft) {
            sprite.scale = new PIXI.Point(-scale, scale);
        }

        const speed = {
            x: ((target.x - start.x) / arriveDelay),
            y: ((target.y - start.y) / arriveDelay)
        };

        this.container.addChild(sprite);
        return {
            start,
            sprite,
            speed,
            target,
            isLeft,
            isTop,
            done: {
                x: false,
                y: false
            }
        }
    };

    private checkCoord = (crow: CrowSprite, targetLower: boolean, coord: 'x' | 'y') => {
        if (targetLower) {
            if (crow.sprite[coord] > crow.target[coord]) {
                crow.sprite[coord] = crow.target[coord];
                crow.done[coord] = true;
            }
        } else if (crow.sprite[coord] < crow.target[coord]) {
            crow.sprite[coord] = crow.target[coord];
            crow.done[coord] = true;
        }
    };

    tick = () => {
        const elapsed = this.props.app.ticker.elapsedMS;

        this.crows.forEach(crow => {
            if (crow.done.x && crow.done.y) return;
            crow.sprite.x += elapsed * (crow.speed.x / 10);
            crow.sprite.y += elapsed * (crow.speed.y / 10);

            this.checkCoord(crow, crow.isLeft, 'x');
            this.checkCoord(crow, crow.isTop, 'y');

            if (crow.done.x && crow.done.y) {
                crow.sprite.stop();
            }
        });
    };

    render() {
        return <Container ref={(c: any) => this.container = c} />;
    }
}

export default withResources(withPixiApp(
    ModalBackground));
