export type Factor = { width: number, height: number, x: number, y: number };

// TODO: yep, this should be refactored, but seriously, screw this
export function alignFactors(cardsCount: number, viewport: { width: number, height: number }, cardRatio: number): Factor[] {
    switch (cardsCount) {
        case 1:
            return alignFactors1(cardsCount, viewport, cardRatio);
        case 2:
            return alignFactors2(cardsCount, viewport, cardRatio);
        case 3:
            return alignFactors3(cardsCount, viewport, cardRatio);
        case 4:
            return alignFactors4(cardsCount, viewport, cardRatio);
    }
    const b = alignFactors4(cardsCount, viewport, cardRatio);
    let left = cardsCount - 4;
    for (let i = 0; left > 0; i++, left--) {
        b.push(b[i]);
    }
    return b;
}

function alignFactors1(cardsCount: number, viewport: { width: number, height: number }, cardRatio: number) {
    const screenRatio = viewport.width / viewport.height;

    const marginX = 0;
    const marginY = 0.05;

    const availableWidth = 1 - (marginX * 2);
    const availableHeight = 1 - (marginY * 2);

    function get() {
        const cardHeight = availableHeight * screenRatio;
        const cardWidth = availableHeight * cardRatio;

        if (cardHeight > availableHeight) {
            const scaleFactor = availableHeight / cardHeight;
            return {
                cardHeight: cardHeight * scaleFactor,
                cardWidth: cardWidth * scaleFactor
            }
        }

        return {
            cardHeight, cardWidth
        }
    }

    const { cardWidth, cardHeight } = get();

    const cardX = (availableWidth - cardWidth) / 2 + marginX;
    const cardY = (availableHeight - cardHeight) / 2 + marginY;

    return [{
        x: cardX,
        y: cardY,
        width: cardWidth,
        height: cardHeight
    }]
}

function alignFactors2(cardsCount: number, viewport: { width: number, height: number }, cardRatio: number) {
    const marginX = 0.01;
    const marginY = 0.01;

    const screenRatio = viewport.width / viewport.height;

    const availableWidth = 1 - (marginX * 2);
    const availableHeight = 1 - (marginY * 2);

    function get() {
        const cardWidth = availableWidth / 2.5;
        const cardHeight = cardWidth / cardRatio * screenRatio;

        if (cardHeight > availableHeight) {
            const scaleFactor = availableHeight / cardHeight;
            return {
                cardHeight: cardHeight * scaleFactor, cardWidth: cardWidth * scaleFactor
            }
        }

        return {
            cardHeight, cardWidth
        }
    }

    const { cardWidth, cardHeight } = get();

    const horizontalPadding = (availableWidth - cardWidth * 2) / 3;

    const centerX = (availableWidth - cardWidth) / 2;
    const centerY = (availableHeight - cardHeight) / 2;
    const cardY = centerY + marginY;

    return [{
        x: marginX + horizontalPadding,
        y: cardY,
        width: cardWidth,
        height: cardHeight
    }, {
        x: marginX + cardWidth + horizontalPadding * 2,
        y: cardY,
        width: cardWidth,
        height: cardHeight
    }]
}

function alignFactors3(cardsCount: number, viewport: { width: number, height: number }, cardRatio: number) {
    const marginX = 0.01;
    const marginY = 0.01;

    const screenRatio = viewport.width / viewport.height;

    const availableWidth = 1 - (marginX * 2);
    const availableHeight = (1 - (marginY * 2));

    function get() {
        const cardWidth = availableWidth / 2.5;
        const cardHeight = cardWidth / cardRatio * screenRatio;
        const vertPad = (availableHeight - cardHeight * 2);

        if ((cardHeight * 2) > availableHeight) {
            const scaleFactor = (availableHeight / (cardHeight * 2.2));
            return {
                cardHeight: cardHeight * scaleFactor,
                cardWidth: cardWidth * scaleFactor
            }
        }

        return {
            cardHeight, cardWidth
        }
    }

    const { cardWidth, cardHeight } = get();

    const horizontalPadding = (availableWidth - cardWidth * 2) / 3;
    const vertPad = (availableHeight - cardHeight * 2) / 3;

    const centerX = (availableWidth - cardWidth) / 2;
    const centerY = (availableHeight / 2 - cardHeight) / 2;
    const cardY = centerY + marginY;

    const middleX = centerX + marginX;
    const middleY = cardY + cardHeight + vertPad;

    return [{
        x: marginX + horizontalPadding,
        y: cardY,
        width: cardWidth,
        height: cardHeight
    }, {
        x: marginX + cardWidth + horizontalPadding * 2,
        y: cardY,
        width: cardWidth,
        height: cardHeight
    }, {
        x: middleX,
        y: middleY,
        width: cardWidth,
        height: cardHeight
    }]
}

function alignFactors4(cardsCount: number, viewport: { width: number, height: number }, cardRatio: number) {
    const marginX = 0.01;
    const marginY = 0.01;

    const screenRatio = viewport.width / viewport.height;

    const availableWidth = 1 - (marginX * 2);
    const availableHeight = (1 - (marginY * 2));

    function get() {
        const cardWidth = availableWidth / 2.5;
        const cardHeight = cardWidth / cardRatio * screenRatio;

        if ((cardHeight * 2) > availableHeight) {
            const scaleFactor = (availableHeight / (cardHeight * 2.2));
            return {
                cardHeight: cardHeight * scaleFactor,
                cardWidth: cardWidth * scaleFactor
            }
        }

        return {
            cardHeight, cardWidth
        }
    }

    const { cardWidth, cardHeight } = get();

    const horizontalPadding = (availableWidth - cardWidth * 2) / 3;
    const vertPad = (availableHeight - cardHeight * 2) / 3;

    const centerY = (availableHeight / 2 - cardHeight) / 2;
    const cardY = centerY + marginY;

    const middleY = cardY + cardHeight + vertPad;

    return [{
        x: marginX + horizontalPadding,
        y: cardY,
        width: cardWidth,
        height: cardHeight
    }, {
        x: marginX + cardWidth + horizontalPadding * 2,
        y: cardY,
        width: cardWidth,
        height: cardHeight
    }, {
        x: marginX + horizontalPadding,
        y: middleY,
        width: cardWidth,
        height: cardHeight
    }, {
        x: marginX + cardWidth + horizontalPadding * 2,
        y: middleY,
        width: cardWidth,
        height: cardHeight
    }]
}
