import { PlagueAction} from '../components/appStates/plagueTurnState';
import { allCharacters, characters, healerCharacters } from '../data/characters';
import { RecordedGame, RecordedTurn } from '../components/appStates/replayState';
import { GameAction, TurnState } from '../model/actions';

export type ActionType = GameAction['type'];

type Position = { pointer: number };

const actionIds: { [key in ActionType]: number } = {
    movement: 1,
    contaminate: 2,
    'siege-start': 3,
    'siege-end': 4
};
const actionTypes: { [key: number]: ActionType } = Object.fromEntries(Object.entries(actionIds)
    .map(([key, idx]) => [idx, key])) as any;

const bits = (val: number | boolean, pad: number) => {
    val = typeof val == 'boolean' ? 1 : val;
    return (val >>> 0).toString(2).padStart(pad, '0');
}

const parseBits = (bits: string, position: { pointer: number }, len: number) => {
    var value = bits.substr(position.pointer, len);
    const v = parseInt(value, 2);
    position.pointer += len;
    return v;
}

const aggregate = <T>(count: number, action: () => T) => {
    let r:T[] = [];
    for (let i = 0; i < count; i++) {
        r.push(action())
    }
    return r;
}

const alph = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-";
const toB64 = (bitString: string) => {
    let acc = '';
    for (let idx = 0; idx < bitString.length; idx+=6) {
        const part = parseInt(bitString.substr(idx, 6), 2);
        acc += alph[part];
    }
    return acc;
};
const fromB64 = (b64: string) => {
    let acc = '';
    for (let c of b64) {
        const padded = alph.indexOf(c).toString(2).padStart(6, '0');
        acc += padded;
    }
    return acc;
};


class TurnsSerializer {
    private version = 1;

    serialize(turns: TurnState[]){
        let acc = bits(this.version, 2);
        acc += bits(turns.length, 6);

        acc += bits(turns[0].initialLocation, 4);
        for (let turn of turns) {
            if (turn.inSiege === -1) {
                acc += '0';
            } else {
                acc += '1' + bits(turn.inSiege, 4)
            }
            // acc += bits(turn.doubleMovement, 1);
            acc += bits(turn.turnActions.length, 4);
            acc += turn.turnActions.map(this.serializeAction).join('');
        }
        return toB64(acc);
    }

    deserialize(data: string): RecordedGame {
        let bits = fromB64(data);
        let position = { pointer: 0 };
        const version = parseBits(bits, position, 2);
        const turnsCount = parseBits(bits, position, 6);
        let initialLocation = parseBits(bits, position, 4);
        let turns: RecordedTurn[] = [];
        for (let turnNo = 1; turnNo <= turnsCount; turnNo++) {

            const isInSiege = parseBits(bits, position, 1);
            let inSiege = isInSiege === 1 ? parseBits(bits, position, 4) : -1;

            // const dmovement = parseBits(bits, position, 1);
            let turn: RecordedTurn = {
                turnNo,
                actions: [],
                inSiege
            };
            turns.push(turn);
            const actionCount = parseBits(bits, position, 4);
            turn.actions = aggregate(actionCount, () => this.deserializeActionDescriptor(bits, position));
        }

        return {
            serializationVer: version,
            initialLocation,
            turns
        };
    }

    deserializeActionDescriptor = (bits: string, position: Position): GameAction => {
        const actionType = actionTypes[parseBits(bits, position, 4)];
        switch (actionType) {
            case 'siege-end':
            case 'siege-start':
            case 'contaminate':
                const affectedCount = parseBits(bits, position, 4);
                let affected: string[] = [];
                for (let affectedIdx = 0; affectedIdx < affectedCount; affectedIdx++) {
                    affected.push(this.deserializeChar(parseBits(bits, position, 4)).id);
                }
                return {
                    type: actionType,
                    affected
                };

            case 'movement':
                return {
                    type: actionType,
                    to: parseBits(bits, position, 4)
                }
        }
    }

    serializeAction = (action: PlagueAction) => {
        const d = action.descriptor;
        let acc = bits(actionIds[d.type], 4);
        switch (d.type) {
            case 'contaminate':
            case 'siege-end':
            case 'siege-start':
                acc += bits(d.affected.length, 4)
                    + d.affected.map(this.serializeChar).join('');
                break;

            case 'movement':
                acc += bits(d.to, 4);
                break;
        }
        return acc;
    }

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

export const serializer = new TurnsSerializer();
