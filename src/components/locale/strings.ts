import i18n from 'i18next';

export const main = {
    turnNo: ['Хід {{turn}}', ['turn']],
    cannotEndSiegeOnSameTurn: ['Неможоливо закінчити облогу на тому ж ході, на якому вона почата!'],
    cannotEndSiege: ['Неможоливо закінчити облогу'],
    cannotStartSiegeCauseMovements: ['Неможоливо почати облогу на ході з переміщенням'],
    siegeEndSuccessfully: ['Облогу закінчено'],
    siegeCancelledCauseMovement: ['Облогу скасовано через переміщення'],
    startOfTurn: ['Початок ходу'],
    movementToLocation: ['Рух до {{locationNo, if-not:[0]}}«{{location}}»', ['locationNo', 'location']],
    selectCharacter: ['Оберіть Наближених, які були уражені'],
    siegeStarted: ['Початок облоги'],
} as const;

let trans = {} as any;
for (let key of Object.keys(main)) {
    trans[key] = (main as any)[key][0];
}

i18n.init({
    lng: 'ua',
    debug: true,
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
