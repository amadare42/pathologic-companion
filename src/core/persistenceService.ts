import * as idb from 'idb';
import { ActionSnapshot } from './gameEngine';

interface PathologicDb extends idb.DBSchema {
    actions: {
        key: number;
        value: ActionSnapshot;
    },
    lastGames: {
        key: number,
        value: string
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
}

export const trackingService = new PersistenceService();
