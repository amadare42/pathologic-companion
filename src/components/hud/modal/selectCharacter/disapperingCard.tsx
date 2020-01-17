import { PixiComponent, withPixiApp } from '@inlet/react-pixi';
import { Resources, withResources } from '../../../mapView/loadResources';
import { Rectangle } from '../../../../model';
import * as gsap from 'gsap';
import { timings } from './timings';
import * as PIXI from 'pixi.js';

interface Props {
    app: PIXI.Application,
    scale: number;
    target: { x: number, y: number, scale: number };
    tex: PIXI.Texture,
    resources: Resources,
    position: Rectangle;
}

export const DisappearingCard = withPixiApp(withResources(PixiComponent<Props, any>('DisappearingCard', {
    create(props) {
        const { scale, resources, target, position } = props;

        const maskSprt = PIXI.Sprite.from(resources.cardMaskTex);
        // align mask paddings
        maskSprt.x = -60;
        maskSprt.y = -98;

        const sprite = PIXI.Sprite.from(props.tex);

        const displacementSprite = PIXI.Sprite.from(props.resources.cloudTex);
        displacementSprite.scale.set(scale, scale);
        displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        const filter = new PIXI.filters.DisplacementFilter(displacementSprite, 0);
        filter.padding = 500;

        const targetAnchorX = 0.1;
        const targetAnchorY = 0.4;

        const container = new PIXI.Container();

        container.position.set(position.x,  position.y);
        container.scale.set(scale, scale);

        const positionTl = new gsap.TimelineLite()
            .to(container.position, timings.cardRealign,{ x: target.x, y: target.y })
            .to(container.scale, timings.cardRealign, { x: target.scale, y: target.scale }, timings.mod('cardRealign'))
        ;

        const disTl = new gsap.TimelineLite()
            .to(displacementSprite.anchor, timings.destruction, { x: targetAnchorX * target.scale, y: targetAnchorY * target.scale })
            .to(filter.scale, timings.destruction, { x: -3000, y: -3000, ease: gsap.Expo.easeIn }, timings.mod('destruction'))
            .to(container, timings.destruction, { alpha: 0, ease: gsap.Power4.easeIn }, timings.mod('destruction'))
        ;

        const masterTl = new gsap.TimelineLite({ paused: true })
            .add(positionTl)
            .add(disTl)
        ;

        sprite.filters = [filter];

        container.addChild(sprite);
        container.addChild(maskSprt);

        maskSprt.isMask = true;
        container.mask = maskSprt;

        masterTl.play();
        return container;
    }
})));
