import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import * as sqlite3 from 'sqlite3';

import { Response } from 'express';
import { Table } from 'src/app/table/table.interface';
import { getConfiguration } from './config';
import { parseString } from 'xml2js';

export const createTablesTable = (db: sqlite3.Database) => {
    db.exec(
        `create table tables (
            id integer primary key autoincrement,
            name text not null unique,
            description text not null,
            type text,
            rom text,
            manufacturer text not null,
            year integer not null,
            rating integer,
            ipdbid integer,
            vpsid text,
            b2s text,
            haspup integer
        )`,
        (err) => {
            if (err) {
                console.error(`DB create error: ${err.message}`);

                throw err;
            }
        }
    );
};

export const importVpx = async (res: Response, db: sqlite3.Database) => {
    const { vpxdb, error } = await getConfiguration(db);
    if (!vpxdb) {
        res.status(500).send(error);
    }

    fs.readFile(vpxdb, (err, data) => {
        if (err) {
            console.error(`FS error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        // Decode
        const decoded = iconv.decode(data, 'windows-1252');

        return new Promise((resolve, reject) => {
            // Handle data
            parseString(decoded, (xerr, parsed) => {
                if (xerr) {
                    console.error(`XML parse error: ${xerr.message}`);

                    reject(res.status(500).send(xerr.message));
                }

                const sql: string[] = [];
                const results = parsed?.menu?.game.map((game: any) => {
                    const obj: any = {};
                    obj.name = game.$.name;
                    delete game.$;

                    // Convert all the array values to simple ones
                    Object.entries(game).forEach(([key, value]) => {
                        obj[key] = (value as any)[0];
                    });

                    sql.push(`
insert into tables (name, description, type, rom, manufacturer, year, rating, ipdbid, vpsid, b2s, haspup)
values ("${obj.name}", "${obj.description}", "${obj.type}", "${obj.rom}", "${obj.manufacturer}",
${obj.year}, ${obj.rating}, ${obj.ipdbid || null}, "${obj.vpsid || ''}", "${obj.b2s || ''}", ${obj.haspup || 0})
on conflict (name) do update set description="${obj.description}", rom="${obj.rom}", rating=${obj.rating},
vpsid="${obj.vpsid || ''}", b2s="${obj.b2s || ''}", haspup=${obj.haspup || 0};
`);

                    return obj;
                });

                // Execute SQL
                sql.unshift('begin;');
                sql.push('commit;');

                db.exec(sql.join(' '), (err) => {
                    if (err) {
                        console.error(`DB import error: ${err.message}`);

                        reject(err.message);
                    }
                });

                resolve(res.send(results));
            });
        });
    });
};

export const getTables = (db: sqlite3.Database, id?: string | undefined): Promise<Table[]> =>
    new Promise((resolve, reject) => {
        let sql = 'select * from tables';
        if (id) {
            sql += ` where id = ${id}`;
        }

        db.all(sql, (err, rows) => {
            if (err) {
                console.error(`DB error: ${err.message}`);

                reject(err.message);
            }

            resolve(rows);
        });
    });

export const updateTables = (db: sqlite3.Database, body: any, id: string): Promise<boolean> =>
    new Promise((resolve, reject) => {
        const sql = `
update tables set
type = '${body.type}',
rom = '${body.rom}',
rating = ${body.rating},
vpsid = '${body.vpsid}',
b2s = '${body.b2s}',
haspup = ${body.haspup === true ? 1 : 0}
where id = ${id}`;

            db.run(sql, (err: Error) => {
                if (err) {
                    console.error(`DB update error: ${err.message}`);

                    reject(err.message);
                }

                resolve(true);
            });
    });
