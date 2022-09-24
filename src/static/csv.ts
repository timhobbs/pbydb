import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import * as sqlite3 from 'sqlite3';

import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Server } from 'socket.io';
import { parse as parseSync } from 'csv-parse/sync';

export const importFromCsv = (tableName: string, data: string[][], db: sqlite3.Database, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    return new Promise<void>((resolve, reject) => {
        try {
            // Get column names - replace spaces/dashes in names
            const firstRow = (data.shift() || []).map((col: string) => col.replace(/\s/g, '').replace(/-/g, ''));

            io.emit('record-total', data.length);

            const placeholder = `(${firstRow.map((col: any) => '?').join(',')})`;
            const insert =  `insert into ${tableName} (${
                firstRow.reduce((row: string[], column: string) => {
                    row.push(column.replace('-', ''));

                    return row;
                }, []).join(',')
            }) values ${placeholder}`;

            data.reduce(async (acc, params: string[], index: number) => {
                await acc;
                return new Promise<any>((resolve, reject) => {
                    db.run(insert, params, function (err) {
                        if (err) {
                            io.emit('record-status', { success: false, msg: err.message, index: index });

                            return resolve(err);
                        }

                        io.emit('record-status', { success: true, msg: params.join(','), index: index });

                        return resolve(this);
                    });
                });
            }, Promise.resolve());

            return resolve();
        } catch (err) {
            return reject(err);
        }
    });
};

export const parseCsv = (filename: string, readEncoding: BufferEncoding = 'utf8', encoding: string = 'utf8') => {
    return new Promise<string[][]>((resolve, reject) => {
        fs.readFile(filename, readEncoding, (err, data: Buffer | string) => {
            if (err) {
                console.error(`FS error: ${err.message}`);

                reject(err.message);
            }

            if (encoding !== 'utf8') {
                // Decode
                data = iconv.decode(data as Buffer, encoding);

                // BOM check
                const bomCheck = data.slice(0, 1);
                if (bomCheck === 'ÿ') {
                    data = data.slice(1);
                }

                // Remove return carriage
                data = data.replace(/\r/g, '');
            }

            const options = {
                bom: true,
                relax_column_count: true,
                skip_empty_lines: true,
                relax_quotes: true,
                record_delimiter: '\n',
            };

            const dataRows = (data as string).split('\n');
            const parsedData = dataRows.map(row => parseSync(row, options)[0])
                .map((row, index) => {
                    if (index === 0) {
                        row.splice(1, 0, 'GameName');
                        row.splice(2, 0, 'GameSystem');
                    } else if (row && row.length) {
                        const lastDot = row[0].lastIndexOf('.');
                        const name = row[0].slice(0, lastDot);
                        const system = row[0].slice(lastDot + 1);
                        row.splice(1, 0, name);
                        row.splice(2, 0, system);
                    }

                    return row;
                });

            resolve(parsedData);
        });
    });
};
