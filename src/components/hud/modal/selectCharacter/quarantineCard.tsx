import { PixiComponent } from '@inlet/react-pixi';
import { Rectangle } from '../../../../model';
import * as gsap from 'gsap';
import { timings } from './timings';
import * as PIXI from 'pixi.js';

interface Props {
    scale: number;
    target: { x: number, y: number, scale: number };
    tex: PIXI.Texture,
    position: Rectangle;
}

export const QuarantineCard = PixiComponent<Props, any>('QuarantineCard', {
    create(props) {
        const { scale, target, position } = props;

        const sprite = PIXI.Sprite.from(props.tex);
        const effectSprite = PIXI.Sprite.from(props.tex);
        effectSprite.alpha = 0;

        const filter = new PIXI.filters.ColorMatrixFilter();
        filter.greyscale(1.3, false);
        effectSprite.filters = [filter];

        const container = new PIXI.Container();
        container.position.set(position.x,  position.y);
        container.scale.set(scale, scale);

        const positionTl = new gsap.TimelineLite()
            .to(container.position, timings.cardRealign,{ x: target.x, y: target.y })
            .to(container.scale, timings.cardRealign, { x: target.scale, y: target.scale }, timings.mod('cardRealign'))
        ;

        const disTl = new gsap.TimelineLite()
            .to(effectSprite, timings.destruction, { alpha: 0.6 }, timings.mod('destruction'))
            .to(container, timings.destruction, { alpha: 0, ease: gsap.Power3.easeIn }, timings.mod('destruction'))
        ;

        const masterTl = new gsap.TimelineLite({ paused: true })
            .add(positionTl)
            .add(disTl)
        ;

        container.addChild(sprite);
        container.addChild(effectSprite);

        masterTl.play();
        return container;
    }
});
