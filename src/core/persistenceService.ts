import * as idb from 'idb';
import { ActionSnapshot } from './gameEngine';
import { urlSerializer } from './gameActionsUrlSerializer';

interface PathologicDb extends idb.DBSchema {
    actions: {
        key: number;
        value: ActionSnapshot;
    }
}

export class PersistenceService {

    dbPromise: Promise<idb.IDBPDatabase<PathologicDb>>;

    constructor() {
        this.dbPromise = this.open();
    }

    open() {
        return idb.openDB<PathologicDb>('pathologic-companion-db', 1, {
            upgrade(db) {
                db.createObjectStore('actions');
            }
        })
    }

    writeAll = (actions: ActionSnapshot[]) => {
        this.dbPromise.then(async db => {
            const tx = db.transaction('actions', 'readwrite');
            const store = tx.objectStore('actions');
            await store.clear();
            for (let i = 0; i < actions.length; i++){
                let action = actions[i];
                await store.put(action, i)
            }
        });
        const message = urlSerializer.serialize(actions.map(a => a.action));
        console.log(message);
        // console.log(urlSerializer.deserialize(message));
    };

    getAll = () => {
        return this.dbPromise.then(async db => {
            const tx = db.transaction('actions', 'readonly');
            const store = tx.objectStore('actions');
            const count = await store.count();
            if (count === 0) {
                return null;
            }
            const value = await store.getAll();
            return value || null;
        });
    }

    // updateTurn(turnData: TurnState): void {
    //     this.dbPromise.then(async db => {
    //         const tx = db.transaction('turns', 'readwrite');
    //         const store = tx.objectStore('turns');
    //         await store.put(turnData, turnData.turnNo);
    //         const turns = await store.getAll();
    //         console.log(serializer.serialize(turns));
    //     });
    // }
    //
    // getLatestTurn(): Promise<TurnState | null> {
    //     return this.dbPromise.then(async db => {
    //         const tx = db.transaction('turns', 'readonly');
    //         const store = tx.objectStore('turns');
    //         const count = await store.count();
    //         if (count === 0) {
    //             return null;
    //         }
    //         const value = await store.get(count);
    //         return value || null;
    //     });
    // }
}

export const trackingService = new PersistenceService();
