import * as express from 'express';
import * as sqlite3 from 'sqlite3';

import { getVpsdb, getVpslookupData } from './vps';

import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Server } from 'socket.io';
import { importFromCsv } from './csv';

export const createVpslookupTable = (db: sqlite3.Database) => {
    // Create table
    db.exec(
        `create table vpslookup (
            id integer primary key autoincrement,
            GameFileName text,
            GameName text,
            GameDisplay text,
            MediaSearch text,
            Manufact text,
            GameYear text,
            NumPlayers text,
            GameType text,
            Category text,
            GameTheme text,
            WebLinkURL text,
            IPDBNum text,
            AltRunMode text,
            DesignedBy text,
            Author text,
            GAMEVER text,
            Rom text,
            Tags text,
            VPSID text not null unique
        )`,
        (err) => {
            if (err) {
                console.error(`DB create error: ${err.message}`);

                throw err;
            }
        }
    );
};

export const importVpslookup = async (req: express.Request, res: express.Response, db: sqlite3.Database, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    const data = await getVpsdb(db);
    const vpxTables = data.filter((table: any) => table.features.includes('VPX'));
    const lookupData = getVpslookupData(vpxTables);
    console.log('***** lookupData.length', lookupData.length);

    await updateVpslookupTable(lookupData, db, io);
    const result = { total: lookupData.length };

    return res.send(result);
};

function updateVpslookupTable(data: string[][], db: sqlite3.Database, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    return importFromCsv('vpslookup', data, db, io);
};
