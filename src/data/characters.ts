export type Character = {
    name: string;
    id: string;
    closeFor: number;
    gender: number;
    isHealer?: boolean;
};

export const characters: Character[] = [
    // bak
    { name: 'Андрей Стаматин', id: 'andrei', closeFor: 0, gender: 1 },
    { name: 'Мария Каина', id: 'maria', closeFor: 0, gender: 0 },
    { name: 'Младший Влад', id: 'vlad', closeFor: 0, gender: 1 },

    // burah
    { name: 'Александр Сабуров', id: 'alexandr', closeFor: 1, gender: 1 },
    { name: 'Оспина', id: 'ospina', closeFor: 1, gender: 0 },
    { name: 'Рубин', id: 'rubin', closeFor: 1, gender: 1 },

    // samo
    { name: 'Капелла', id: 'kapella', closeFor: 2, gender: 0 },
    { name: 'Ноткин', id: 'notkin', closeFor: 2, gender: 1 },
    { name: 'Спичка', id: 'spichka', closeFor: 2, gender: 1 },
];

export const healerCharacters: Character[] = [
    { name: 'Бакалавр', id: 'bakalavr', closeFor: 0, gender: 1, isHealer: true },
    { name: 'Самозванка', id: 'samozvanka', closeFor: 1, gender: 0, isHealer: true },
    { name: 'Гаруспик', id: 'garuspik', closeFor: 2, gender: 1, isHealer: true },
];

export const allCharacters = characters.concat(healerCharacters);
