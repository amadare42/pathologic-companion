import { PlagueTurnState, GameState } from '../components/appStates/plagueTurnState';
import * as idb from 'idb';
import { serializer } from './turnsSerializer';
import { TurnState } from '../model/actions';

interface PathologicDb extends idb.DBSchema {
    turns: {
        key: number;
        value: TurnState;
    }
}

export class TurnTrackingService {

    dbPromise: Promise<idb.IDBPDatabase<PathologicDb>>;

    constructor() {
        this.dbPromise = this.open();
    }

    open() {
        return idb.openDB<PathologicDb>('pathologic-companion-db', 1, {
            upgrade(db) {
                db.createObjectStore('turns');
            }
        })
    }

    updateTurn(turnData: TurnState): void {
        this.dbPromise.then(async db => {
            const tx = db.transaction('turns', 'readwrite');
            const store = tx.objectStore('turns');
            await store.put(turnData, turnData.turnNo);
            const turns = await store.getAll();
            console.log(serializer.serialize(turns));
        });
    }

    getLatestTurn(): Promise<TurnState | null> {
        return this.dbPromise.then(async db => {
            const tx = db.transaction('turns', 'readonly');
            const store = tx.objectStore('turns');
            const count = await store.count();
            if (count === 0) {
                return null;
            }
            const value = await store.get(count);
            return value || null;
        });
    }
}

export const trackingService = new TurnTrackingService();
