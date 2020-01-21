export interface PlayerEffectItem {
    id: string,
    name: string,
    image: string
    type: string;
}

export const m12: PlayerEffectItem = {
    id: 'm-12',
    name: 'Верхом на крысах',
    image: 'cards/missions/12.jpg',
    type: 'mission'
};

export const sPlusMovement: PlayerEffectItem = {
    id: 's-plus-movement',
    name: 'Перемещение',
    image: 'cards/stams/bonus_movement.jpg',
    type: 'stam'
};
