import * as sqlite3 from 'sqlite3';

import { NextFunction, Request, Response } from 'express';
import { importFromCsv, parseCsv } from './csv';

import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Server } from 'socket.io';
import { getConfiguration } from './config';

export const createStatsTable = (db: sqlite3.Database) => {
    // Create table
    db.exec(
        `create table stats (
            id integer primary key autoincrement,
            Game text not null,
            GameName text,
            GameSystem text,
            LastPlayed text,
            PlayCount text,
            PlayTime text,
            IsFavorite text,
            Rating text,
            AudioVolume text,
            Categories text,
            IsHidden text,
            DateAdded text,
            HighScoreStyle text,
            MarkedForCapture text,
            ShowWhenRunning text
        )`,
        (err) => {
            if (err) {
                console.error(`DB create error: ${err.message}`);

                throw err;
            }
        }
    );
};

export const getStats = (req: Request, res: Response, next: NextFunction, db: sqlite3.Database) => {
    db.all('select * from stats', async (err, rows) => {
        if (err) {
            console.error(`DB get error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        console.log('***** rows', rows.length);

        return res.send(rows);
    });
};

export const importStats = async (res: Response, db: sqlite3.Database, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    const { vpxstats, error } = await getConfiguration(db);
    if (!vpxstats) {
        return res.status(500).send(error);
    }

    try {
        return new Promise(async (resolve, reject) => {
            const data = await parseCsv(vpxstats, 'utf16le', 'windows-1252');
            await importFromCsv('stats', data, db, io)
            const result = { total: data.length };
            resolve(result);
        });
    } catch (err: any) {
        return res.status(500).send(err);
    }
};
