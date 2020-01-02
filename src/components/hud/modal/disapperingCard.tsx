import { PixiComponent, withPixiApp } from '@inlet/react-pixi';
import { Resources, withResources } from '../../mapView/loadResources';
import { Character } from '../../../data/characters';
import * as ease from 'js-easing-functions';
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
        const time = 2000;
        const targetAnchorX = 0.3;
        const targetAnchorY = 0.4;

        const targetScale = scale * 0.5;
        const targetPos = {
            x: (props.viewport.width - (tex.width * targetScale)) / 2,
            y: (props.viewport.height - (tex.height * targetScale)) / 2,
        };

        let last = 0;

        const container = new PIXI.Container();

        function animate(ms: number) {
            if (last == 0) {
                last = ms;
                requestAnimationFrame(animate);
                return;
            }
            const progress = ms - last;
            const scale = ease.easeInQuint(progress, 1, target, time);
            if (scale > target) {
                filter.scale.set(scale, scale);
            }

            const anchor = (targetAnchorX / time) * progress;
            const anchorY = (targetAnchorY / time) * progress;
            displacementSprite.anchor.set(anchor, anchorY);

            // container.x = ease.easeInQuint(progress, props.position.x, targetPos.x - props.position.x, time);
            // container.y = ease.easeInQuint(progress, props.position.y, targetPos.y - props.position.y, time);
            // const containerScale = 1 - ease.easeInQuint(progress, 0, 0.5, time);
            // container.scale.set(containerScale, containerScale);

            sprite.alpha = 1 - ease.easeInQuint(progress, 0, 1, time);
            if (scale < target) {
                props.onAnimationEnd();
                return;
            }
            requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate);

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
