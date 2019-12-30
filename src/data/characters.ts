export type Character = {
    name: string;
    id: string;
    closeFor: number;
};

export const characters: Character[] = [
    // bak
    { name: 'Андрей Стаматин', id: 'andrei', closeFor: 0 },
    { name: 'Мария Каина', id: 'maria', closeFor: 0 },
    { name: 'Младший Влад', id: 'vlad', closeFor: 0 },

    // burah
    { name: 'Александр Сабуров', id: 'alexandr', closeFor: 1 },
    { name: 'Оспина', id: 'ospina', closeFor: 1 },
    { name: 'Рубин', id: 'rubin', closeFor: 1 },

    // samo
    { name: 'Капелла', id: 'kapella', closeFor: 2 },
    { name: 'Ноткин', id: 'notkin', closeFor: 2 },
    { name: 'Спичка', id: 'spichka', closeFor: 2 },
];
