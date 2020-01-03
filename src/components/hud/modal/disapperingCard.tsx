import { PixiComponent, withPixiApp } from '@inlet/react-pixi';
import { Resources, withResources } from '../../mapView/loadResources';
import { Character } from '../../../data/characters';
import { Rectangle } from '../../../model';
import * as gsap from 'gsap';

interface Props {
    app: PIXI.Application,
    character: Character,
    resources: Resources,
    viewport: { width: number, height: number },
    onAnimationEnd: () => void;
    position: Rectangle;
}

export const DisappearingCard = withPixiApp(withResources(PixiComponent<Props, any>('DisappearingCard', {
    create(props) {
        const tex = new PIXI.Texture(props.resources.characterCards[props.character.id]);
        const scale = props.position.width / tex.width;
        const maskSprt = PIXI.Sprite.from('cards/card_mask.png');
        maskSprt.scale.set(scale, scale);
        maskSprt.x = -60 * scale;
        maskSprt.y = -98 * scale;

        const sprite = PIXI.Sprite.from(tex);
        sprite.scale.set(scale);

        const displacementSprite = PIXI.Sprite.from(props.resources.cloudTex);
        displacementSprite.scale.set(scale, scale);
        displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        const filter = new PIXI.filters.DisplacementFilter(displacementSprite, 0);
        filter.padding = 500;

        const target = -3000;
        const targetAnchorX = 0.1;
        const targetAnchorY = 0.4;

        const targetScale = props.viewport.height / tex.height * 1.5;

        const targetPos = {
            x: (props.viewport.width - (tex.width * targetScale * scale)) / 2,
            y: (props.viewport.height - (tex.height * targetScale * scale)) / 2,
        };

        const container = new PIXI.Container();

        const times = {
            appear: 0.2,
            scale: 0.6
        };

        const appearTl = new gsap.TimelineLite()
            .to(container, times.appear, { alpha: 1})
        ;

        const positionTl = new gsap.TimelineLite()
            .to(container.position, times.scale,{ x: targetPos.x, y: targetPos.y })
            .to(container.scale, times.scale, { x: targetScale, y: targetScale }, `-=${times.scale}`)
        ;

        const disTl = new gsap.TimelineLite()
            .to(displacementSprite.anchor, 1, { x: targetAnchorX * targetScale, y: targetAnchorY * targetScale })
            .to(filter.scale, 1, { x: target, y: target, ease: gsap.Expo.easeIn }, '-=1')
            .to(container, 1, { alpha: 0, ease: gsap.Power4.easeIn }, '-=1')
        ;

        const masterTl = new gsap.TimelineLite()
            // .add(appearTl)
            .add(positionTl, "+=0.3")
            .add(disTl)
        ;
        masterTl.play();

        sprite.filters = [filter];

        container.x = props.position.x;
        container.y = props.position.y;
        container.addChild(sprite);
        container.addChild(maskSprt);

        maskSprt.isMask = true;
        container.mask = maskSprt;

        return container;
    }
})));
