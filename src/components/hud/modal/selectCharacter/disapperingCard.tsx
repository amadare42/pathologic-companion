import { PixiComponent, withPixiApp } from '@inlet/react-pixi';
import { Resources, withResources } from '../../../mapView/loadResources';
import { Character } from '../../../../data/characters';
import { Rectangle } from '../../../../model';
import * as gsap from 'gsap';
import { timings } from './timings';

interface Props {
    app: PIXI.Application,
    character: Character,
    resources: Resources,
    viewport: { width: number, height: number },
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

        const positionTl = new gsap.TimelineLite()
            .to(container.position, timings.cardRealing,{ x: targetPos.x, y: targetPos.y })
            .to(container.scale, timings.cardRealing, { x: targetScale, y: targetScale }, timings.mod('cardRealing'))
        ;

        const disTl = new gsap.TimelineLite()
            .to(displacementSprite.anchor, timings.destruction, { x: targetAnchorX * targetScale, y: targetAnchorY * targetScale })
            .to(filter.scale, timings.destruction, { x: target, y: target, ease: gsap.Expo.easeIn }, timings.mod('destruction'))
            .to(container, timings.destruction, { alpha: 0, ease: gsap.Power4.easeIn }, timings.mod('destruction'))
        ;

        const masterTl = new gsap.TimelineLite()
            .add(positionTl)
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
