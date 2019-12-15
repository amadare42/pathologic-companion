import { AreaKey, areaKeys, areas, steppe } from './data/areas';
import { AreaFill, Particle, Rectangle } from './model';
import * as d3 from 'd3';
import { delay, getRandomInt, getRectangle, refs } from './utils';
import centroid from 'polygon-centroid';

export const animationsConfig = {
    fade: {
        animationTime: 1000,
        particlesCount: 20,
        fadeOutTimeDispersion: 300,
    },
    moveTo: {
        animationTime: 300,
        particlesCount: 6,
        fadeOutTimeDispersion: 100,
        dispersionRange: 50
    },
    continuous: {
        particlesCount: 3,
        ttl: 1500,
        ttlDispersion: 200,
        tickInterval: 100
    },
    particle: {
        size: 150
    }
};

export type D3Rect = d3.Selection<SVGRectElement, unknown, HTMLElement, unknown>;

class MapViewService {

    setAreaFill = async (areaKey: AreaKey, fill: AreaFill, prevFill: AreaFill) => {
        return;
        if (fill === prevFill) {
            return;
        }

        const poly = d3.select(refs.areaPolygon(areaKey, 'idSelector'))
            .interrupt();

        if (fill === 'available') {
            this.setBordersColor(areaKey, 'available');
        } else {
            this.setBordersColor(areaKey, 'default');
        }

        switch (fill) {
            case 'available':
                d3.select(refs.areaPolygon(areaKey, 'idSelector'))
                    .attr('fill', refs.fillId(fill, 'url'));
                break;
                if (steppe.indexOf(areaKey) >= 0) {
                    d3.select(refs.areaPolygon(areaKey, 'idSelector'))
                        .attr('fill', refs.fillId(fill, 'url'));
                } else {
                    this.fillFadeOut(poly);
                }
                break;

            case 'disabled':
                this.fillFadeOut(poly);
                break;

            case 'active':
                this.selectArea(areaKey, fill);
                break;

            case 'passed':
                d3.select(refs.areaPolygon(areaKey, 'idSelector'))
                    .attr('fill', refs.fillId(fill, 'url'));
                const rect = getRectangle(areas[areaKey]);
                this.fadeInMask(areaKey, rect);
                break;
        }
    };

    arrangeBorders = () => {
        // document.querySelector(refs.vectorBordersId('idSelector'))
        //     .querySelectorAll('path')
        //     .
        // const a = d3.select(refs.vectorBordersId('idSelector'))
        //     .selectAll<any, HTMLElement>('path')
            // .sort((a, b) => {
            //     if (!a || !b) {
            //         console.log('wat');
            //         return 0;
            //     }
            //     console.log(a,b);
            //     if (a.className === 'border_available')
            //         return 1;
            //     if (b.className === 'border_available')
            //         return -1;
            //     return 0;
            // });
    };

    selectArea = async (areaKey: AreaKey, fill: AreaFill = 'active') => {
        const rect = getRectangle(areas[areaKey]);
        const maskSelector = refs.maskId(areaKey, "idSelector");

        d3.select(refs.areaPolygon(areaKey, 'idSelector'))
            .attr('fill', refs.fillId(fill, 'url'));

        this.fadeInMask(areaKey, rect);

        // let maskRect = this.getMaskRect(maskSelector);
        // this.setRectSize(maskRect, rect)
        //     .attr('fill', 'white')
        //     .attr('class', 'maskRect')
        //     .style('opacity', 0.000001)
        //     .transition()
        //     .duration(animationsConfig.fade.animationTime)
        //         .ease(d3.easeCubicOut)
        //     .style('opacity', 1);

        this.particlesInRect(rect, maskSelector);
    };

    private fillFadeOut = (poly: d3.Transition<any, any, any, any>) => {
        poly
            .style('opacity', 0.1)
            .transition()
            .duration(animationsConfig.fade.animationTime)
            // .style('opacity', 1e-6)
            .style('opacity', 0.5)
            .attr('fill', refs.fillId('disabled', 'url'));
    };

    private setBordersColor = (areaKey: AreaKey, cls: string) => {
        return d3.select(refs.borderId(areaKey, 'idSelector'))
            .attr('class', 'border_' + cls);
    };


    private fadeInMask = (areaKey: AreaKey, rect: Rectangle) => {
        const maskSelector = refs.maskId(areaKey, "idSelector");
        let maskRect = this.getMaskRect(maskSelector);
        this.setRectSize(maskRect, rect)
            .attr('fill', 'white')
            .attr('class', 'maskRect')
            .style('opacity', 0.000001)
            .transition()
            .duration(animationsConfig.fade.animationTime)
            .ease(d3.easeCubicOut)
            .style('opacity', 1);
    };

    fillArea = async (areaKey: AreaKey, fill: AreaFill = 'active') => {
        const rect = getRectangle(areas[areaKey]);
        const maskSelector = `#mask_${ areaKey }`;

        d3.select(refs.areaPolygon(areaKey, 'idSelector'))
            .attr('fill', refs.fillId(fill, 'url'));

        let maskRect = this.getMaskRect(maskSelector);
        this.setRectSize(maskRect, rect)
            .attr('fill', 'white')
            .attr('class', 'maskRect')
            .style('opacity', 0.000001)
            .transition()
            .duration(animationsConfig.fade.animationTime)
            .ease(d3.easeCubicOut)
            .style('opacity', 1);
    };

    initMaskRect = (areaKey: AreaKey) => {
        const rect = getRectangle(areas[areaKey]);
        const maskSelector = refs.maskId(areaKey, 'idSelector');
        let maskRect = this.getMaskRect(maskSelector);
        this.setRectSize(maskRect, rect)
            .attr('fill', 'white')
            .attr('class', 'maskRect')
    };

    unselectArea = async (areaKey: AreaKey) => {
        const rect = getRectangle(areas[areaKey]);
        const maskSelector = `#mask_${ areaKey }`;

        d3.select(`${ maskSelector } .maskRect`)
            .transition()
            .duration(animationsConfig.fade.animationTime)
            .ease(d3.easeCubicOut)
            .style('opacity', 0.00001)
            .remove();

        const particlesPromise =this.particlesInRect(rect, maskSelector);

        return Promise.all([delay(animationsConfig.fade.animationTime), particlesPromise]);
    };

    moveTo = async (from: AreaKey, to: AreaKey) => {
        return;

        const center1 = centroid(areas[from]);
        const center2 = centroid(areas[to]);

        const { animationTime, particlesCount, fadeOutTimeDispersion, dispersionRange } = animationsConfig.moveTo;
        const size = animationsConfig.particle.size;

        const xStep = (center2.x - center1.x) / particlesCount;
        const yStep = (center2.y - center1.y) / particlesCount;

        for (let i = 0; i < particlesCount; i++) {
            const x = center1.x + xStep * i - size / 2 + getRandomInt(-dispersionRange, dispersionRange);
            const y = center1.y + yStep * i - size / 2 + getRandomInt(-dispersionRange, dispersionRange);
            const angle = getRandomInt(0, 360);
            const delay = getRandomInt(animationTime - fadeOutTimeDispersion, animationTime + fadeOutTimeDispersion);

            this.createHand(d3.select('#rootSvg'), { x, y, angle, href: '/hand_red.svg' })
                .style('opacity', 0.4)
                .transition()
                .duration(delay)
                .remove();
            await new Promise(r => setTimeout(r, animationTime / particlesCount));
        }
    };

    private getMaskRect = (maskSelector: string) => {
        let maskRect: D3Rect = d3.select(`${ maskSelector } .maskRect`);
        if (!maskRect.empty())
            return maskRect;
        return d3.select(maskSelector)
            .append('rect');
    };

    private setRectSize = (d3Rect: D3Rect, rect: Rectangle) => {
        return d3Rect
            .attr('x', rect.x)
            .attr('y', rect.y)
            .attr('width', rect.width)
            .attr('height', rect.height);
    };

    private particlesInRect = async (rect: Rectangle, parentSelector: string) => {
        const { animationTime, particlesCount, fadeOutTimeDispersion } = animationsConfig.fade;
        const size = animationsConfig.particle.size;
        const timePerParticle = animationTime / 3 / particlesCount;

        for (let i = 0; i < particlesCount; i++) {
            const x = rect.x + rect.width / 2 + getRandomInt(-rect.width / 2, rect.width / 2) - size / 2;
            const y = rect.y + rect.height / 2 + getRandomInt(-rect.height / 2, rect.height / 2) - size / 2;
            const angle = getRandomInt(0, 360);
            const delay = getRandomInt(animationTime, animationTime + fadeOutTimeDispersion);

            this.createHand(d3.select(parentSelector), { x, y, angle, href: '/hand_black.svg' })
                .transition()
                .duration(delay)
                .remove();
            await new Promise(r => setTimeout(r, timePerParticle));
        }
    };

    createHand = (sel: d3.Selection<any, any, any, any>, p: Particle, size = animationsConfig.particle.size) => {
        // const size = animationsConfig.particle.size;
        const { x, y, angle, href } = p;
        return sel.append('image')
            .attr('xlink:href', href)
            .attr('width', size)
            .attr('height', size)
            .attr('x', x)
            .attr('y', y)
            .attr('transform', `rotate(${ angle }, ${ x + size / 2 }, ${ y + size / 2 })`)
    };
}

export const mapViewService = new MapViewService();
