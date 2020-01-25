import i18n from 'i18next';

export const main = {
    turnNo: ['Хід {{turn}}', ['turn']],
    cannotEndSiegeOnSameTurn: ['Неможоливо закінчити облогу на тому ж ході, на якому вона почата!'],
    cannotEndSiege: ['Неможливо закінчити Облогу'],
    cannotStartSiegeCauseMovements: ['Неможоливо почати облогу на ході з переміщенням'],
    cannotStartSiegeCauseContamination: ['Неможоливо почати облогу на ході з зараженням'],
    cannotStartSiegeCauseSiege: ['Неможоливо почати нову облогу на ході з закінченням попередньої'],
    siegeEndSuccessfully: ['Облогу закінчено'],
    siegeCancelledCauseMovement: ['Облогу скасовано через переміщення'],
    startOfTurn: ['Початок ходу'],
    movementToLocation: ['Рух до {{locationNo, if-not:0}}«{{location}}»', ['locationNo', 'location']],
    startingLocation: ['Початок в {{locationNo, if-not:0}}«{{location}}»', ['locationNo', 'location']],
    selectCharacter: ['Оберіть Наближених, які були уражені'],
    siegeStarted: ['Початок облоги'],
    siegeStartedKilled: ['Початок облоги: {{killed}}', ['killed']],
    siegeEndedKilled: ['Завершення облоги: {{killed}}', ['killed']],
    multipleCharacterKilled: ['{{characters}} уражені', ['characters']],
    characterWoKilled: ['{{char}} уражена', ['char']],
    characterMaKilled: ['{{char}} уражений', ['char']],
    cannotContaminateTwice: ['Неможливо почати зараження кілька разів за хід'],
    cannotContaminateCauseSiege: ['Неможливо почати зараження на ході з облогою'],
    confirmTurnEnd: ['Закінчити хід?'],
    turnEnd: ['Закінчення ходу'],
    phase: ['Фаза {{phase}}', ['phase']],
    additionalMove: ['Додатк. крок'],
    startOfGame: ['Початок гри'],
    selectAreaToStartFrom: ['Оберіть початкову локацію Чуми'],
    healersTurn: ['Хід лікарів'],
    selectHealersEffects: ['Оберіть ефекти'],
    canceledEffect: ['«{{effect}}» скасовано', ['effect']],
    activatedEffect: ['«{{effect}}» активовано', ['effect']],
    cancelSiegeWarning: ['Ця дія скасує Облогу'],
    doubleMovement: ['Подвійне переміщення'],
    finishTurn: ['Закінчити хід'],
    contaminate: ['Зараження'],
    contaminateOfLocation: ['Зараження {{locationNo, if-not:0}}«{{location}}»', ['locationNo', 'location']],
    startSiege: ['Почати Облогу'],
    finishSiege: ['Закінчити Облогу'],
    cancelAction: ['Відмінити дію'],
    cancelSpecificAction: ['Відмінити «{{action}}»', ['action']],
    close: ['Закрити'],
    apply: ['Застосувати'],
    disable: ['Вимкнути'],
    missions: ['Місії'],
    stamms: ['Штами'],
    effectm12: ['Верхом на крысах'],
    effectsPlusMovement: ['Штамм Перемещение'],
    selectLocation: ['Оберіть локацію'],
    restoringGameState: ['Відновлення стану'],
    startNew: ['Почати нову гру'],
    restoreLastGame: ['Відновити останню гру'],
    saveGameReplay: ['Зберегти запис'],
    returnToGame: ['Повернутись до гри'],
    loading: ['Завантаження...']
} as const;

let trans = {} as any;
for (let key of Object.keys(main)) {
    trans[key] = (main as any)[key][0];
}

i18n.init({
    lng: 'ua',
    interpolation: {
        format: (value, format, lng) => {
            if (format && format.startsWith('if-not:')) {
                const values = JSON.parse(format.substring(7)) as any[];
                if (value instanceof Array) {
                    if (values.some(v => v.toString() === value.toString())) {
                        return '';
                    }
                    return value + ' ';
                } else if (value.toString() === values.toString()) {
                    return '';
                } else {
                    return value + ' ';
                }
            }
            return value;
        }
    },
    resources: {
        ua: {
            translation: trans
        }
    }
});

export type MainStrings = typeof main;
export type StringKeys = keyof typeof main;

type ArglessKeys = {
    [K in StringKeys]: MainStrings[K] extends readonly [string] ? K : never
} extends { [_ in keyof MainStrings]: infer U } ? U : never;

type ArgumentedKeys = Exclude<StringKeys, ArglessKeys>;

export interface FormatWithArgs<K extends ArgumentedKeys> {
    ( args: { [key in MainStrings[K][1][number]]: any}): string;
}

export interface Format<K extends ArglessKeys> {
    (): string;
}

export type Strings = {
    [key in StringKeys]: key extends ArglessKeys
        ? Format<key>
        : key extends ArgumentedKeys
            ? FormatWithArgs<key>
            : (...args: any[]) => string;
}

const format18n = (key: string) => (args: any) => {
    return i18n.t(key, args);
};

function getStrings(): Strings {
    let obj: any = {};
    for (const key of Object.keys(main)) {
        obj[key] = format18n(key);
    }
    return obj;
}

export const strings = getStrings();
