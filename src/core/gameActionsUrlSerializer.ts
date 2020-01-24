import { allCharacters } from '../data/characters';
import { GameAction, GameActionType } from '../model/actions';
import { inDebug } from '../debug';

export type ActionType = GameAction['type'];

type Position = { pointer: number };

const actionIds: { [key in ActionType]: number } = {
    start: 1,
    movement: 2,
    contaminate: 3,
    'siege-start': 4,
    'siege-end': 5,
    'end-plague-turn': 6,
    'healers-m12': 7,
    'healers-s-plus-movement': 8,
    'end-healers-turn': 9,
    // 14 max
};

const actionTypes: { [key: number]: ActionType } = Object.fromEntries(Object.entries(actionIds)
    .map(([key, idx]) => [idx, key])) as any;

const bits = (val: number | boolean, pad: number) => {
    val = typeof val == 'boolean'
        ? val ? 1 : 0
        : val;
    return (val >>> 0).toString(2).padStart(pad, '0');
}

const parseBits = (bits: string, position: { pointer: number }, len: number) => {
    var value = bits.substr(position.pointer, len);
    const v = parseInt(value, 2);
    position.pointer += len;
    return v;
}

const alph = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-';
const toB64 = (bitString: string) => {
    let acc = '';
    for (let idx = 0; idx < bitString.length; idx += 6) {
        const strPart = bitString.substr(idx, 6);
        const padded = strPart.padStart(6, '0');
        const part = parseInt(padded, 2);
        acc += alph[part];
    }
    return acc;
};
const fromB64 = (b64: string) => {
    let acc = '';
    for (let c of b64) {

        const part = alph.indexOf(c).toString(2);
        const padded = part.padStart(6, '0');
        acc += padded;
    }
    return acc;
};


class GameActionsUrlSerializer {
    private version = 1;

    serialize(actions: GameAction[]) {
        let acc = bits(this.version, 2);
        const actionStrs = actions.map(this.serializeAction);
        acc += actionStrs.join('') + '0000';
        const b64 = toB64(acc);

        return b64;
    }

    deserialize(data: string): GameAction[] {
        let bits = fromB64(data);
        let position = { pointer: 0 };
        const version = parseBits(bits, position, 2);
        let actions: GameAction[] = [];
        while (position.pointer < bits.length) {
            const actionType = this.deserializeActionType(bits, position);
            if (!actionType) {
                break;
            }
            const action = this.deserializeAction(actionType, bits, position);
            actions.push(action);
        }
        return actions;
    }

    deserializeActionType = (bits: string, position: Position): GameActionType | null => {
        const typeNo  = parseBits(bits, position, 4);
        if (!typeNo) {
            return null;
        }
        return actionTypes[typeNo];
    };

    deserializeAction = (type: GameActionType, bits: string, position: Position): GameAction => {
        switch (type) {
            case 'siege-end':
            case 'siege-start':
            case 'contaminate':
                const affectedCount = parseBits(bits, position, 4);
                let affected: string[] = [];
                for (let affectedIdx = 0; affectedIdx < affectedCount; affectedIdx++) {
                    affected.push(this.deserializeChar(parseBits(bits, position, 4)).id);
                }
                return {
                    type,
                    affected
                };
            case 'healers-m12':
                return {
                    type,
                    active: !!parseBits(bits, position, 1)
                };
            case 'movement':
                return {
                    type,
                    to: parseBits(bits, position, 4)
                };
            case 'start':
                return {
                    type,
                    location: parseBits(bits, position, 4)
                };
            case 'healers-s-plus-movement':
                return {
                    type,
                    to: parseBits(bits, position, 4)
                };
            case 'end-healers-turn':
            case 'end-plague-turn':
                return { type };
        }
        console.error('Unknown type', type);
        return { type };
    };

    serializeAction = (action: GameAction) => {
        let acc = bits(actionIds[action.type], 4);
        switch (action.type) {
            case 'start':
                acc += bits(action.location, 4);
                break;

            case 'contaminate':
            case 'siege-end':
            case 'siege-start':
                const affected = action.affected;
                acc += bits(affected.length, 4)
                    + affected.map(this.serializeChar).join('');
                break;

            case 'movement':
            case 'healers-s-plus-movement':
                acc += bits(action.to, 4);
                break;

            case 'healers-m12':
                acc += bits(action.active, 1);
                break;
        }
        return acc;
    };

    serializeChar(id: string) {
        const charIndex = allCharacters.findIndex(c => c.id === id);
        if (charIndex < 0) {
            throw Error(id);
        }
        return bits(charIndex, 4);
    }

    deserializeChar(idx: number) {
        return allCharacters[idx];
    }
}

export const urlSerializer = new GameActionsUrlSerializer();
// @ts-ignore
inDebug( () => window['urlSerialier'] = urlSerializer );
