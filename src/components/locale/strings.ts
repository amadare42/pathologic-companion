export const main = {
    turnNo: ['Хід {turn}', ['turn']],
    cannotEndSiegeOnSameTurn: ['Неможоливо закінчити облогу на тому ж ході, на якому вона почата!'],
    cannotEndSiege: ['Неможоливо закінчити облогу'],
    cannotStartSiegeCauseMovements: ['Неможоливо почати облогу на ході з переміщенням'],
    siegeEndSuccessfully: ['Облогу закінчено'],
    siegeCancelledCauseMovement: ['Облогу скасовано через переміщення'],
    startOfTurn: ['Початок ходу'],
    movementToLocation: ['Рух до {locationNo} «{location}»', ['locationNo', 'location']],
    selectCharacter: ['Оберіть Наближених які були уражені']
} as const;

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

function format(value: string, args: any) {
    if (!args) {
        return value;
    }
    let s = value;
    for (let key of Object.keys(args)) {
        s = s.replace(new RegExp(`{${key}}`, 'g'), args[key]);
    }
    return s;
}

function getStrings(): Strings {
    let obj: any = {};
    for (const key of Object.keys(main)) {
        obj[key] = (args?: any) => format((main as any)[key][0], args);
    }
    return obj;
}

export const strings = getStrings();
