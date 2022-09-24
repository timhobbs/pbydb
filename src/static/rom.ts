import * as fs from 'fs';
import * as sqlite3 from 'sqlite3';

import { getConfiguration } from './config';
import { getTables } from './tables';

export const updateAllRoms = (db: sqlite3.Database) =>
    new Promise(async (resolve, reject) => {
        const { vpxtables, error } = await getConfiguration(db);
        if (!vpxtables) {
            reject(error);
        }

        const results = [];
        for (const table of await getTables(db)) {
            // Read vbs file
            const vbsPath = `${vpxtables}${table.name}.vbs`;
            let vbsFile;
            try {
                vbsFile = fs.readFileSync(vbsPath, 'utf8');
            } catch (err) {
                continue;
            }

            const rom = vbsFile.match(/cGameName\s*=\s*"([\w]+)"/gi)
                ?.reduce((acc: string[], match) => {
                    // Get romname from string
                    const romName = match.split('"')[1];
                    acc.push(romName);

                    return acc;
                }, []).join('|');

            if (!rom) {
                results.push({ name: table.description, status: 'Not found' });

                continue;
            }

            console.log('***** table name', table.name, 'rom', rom);

            const result = await updateRomById(db, rom, table.id);
            results.push({ name: table.description, status: result });
        }

        resolve(results);
    });

export const updateRomById = (db: sqlite3.Database, rom: string, id: number) =>
    new Promise(async (resolve, reject) => {
        const sql = `update tables set rom = '${rom}' where id = ${id}`
        db.exec(sql, (err) => {
            if (err) {
                console.error(`DB update error: ${err.message}`);

                reject(err.message);
            }

            resolve(true);
        });
    });
