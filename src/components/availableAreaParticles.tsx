import { AreaKey, areas } from '../data/areas';
import React from 'react';
import { Rectangle } from '../model';
import { getRandomInt, getRectangle, refs } from '../utils';
import { animationsConfig, mapViewService } from '../MapViewService';
import * as d3 from 'd3';

interface Props {
    areaKey: AreaKey;
}

export class AvailableAreaParticles extends React.Component<Props, {}> {

    isActive = false;
    rect: Rectangle = null as any;
    currentParticleCount = 0;

    componentDidMount = () => {
        this.isActive = true;
        this.rect = getRectangle(areas[this.props.areaKey]);
        this.particlesTick();
    };

    componentWillUnmount = () => {
        this.isActive = false;
    };

    particlesTick = () => {
        return;
        const { particlesCount, ttl, ttlDispersion, tickInterval } = animationsConfig.continuous;
        if (this.currentParticleCount >= particlesCount || !this.isActive) return;

        const rect = this.rect!;
        const size = animationsConfig.particle.size;

        const x = rect.x + rect.width / 2 + getRandomInt(-rect.width / 2, rect.width / 2) - size / 2;
        const y = rect.y + rect.height / 2 + getRandomInt(-rect.height / 2, rect.height / 2) - size / 2;
        const angle = getRandomInt(0, 360);
        const actualTtl = getRandomInt(ttl - ttlDispersion, ttl + ttlDispersion);

        const mask = d3.select(refs.maskId(this.props.areaKey, 'idSelector'));
        const particle = mapViewService.createHand(mask, {
            href: '/hand_white.svg',
            angle,
            x, y
        });
        particle
            .style('opacity', 1)
            .transition()
            .delay(actualTtl)
            .remove()
            .on('end', this.onParticleRemoved);

        if (this.isActive) {
            setTimeout(this.particlesTick, tickInterval);
        }
    }

    onParticleRemoved = () => {
        this.currentParticleCount --;
    }

    render = () => null;
}
