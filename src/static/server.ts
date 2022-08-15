import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as morgan from 'morgan';
import * as sqlite3 from 'sqlite3';

import { parseString } from 'xml2js';

const vpxDbFile = `/mnt/f/Games/PinballY/Databases/Visual Pinball X/Visual Pinball X.xml`;
const apiBase = `/api`;
const port = 3030;
const pbydb = 'src/static/db/pbydb.db';
const logLevel = 'dev';

// Create the DB if it doesn't exist
if (fs.existsSync(pbydb) === false) {
    const newDb = new sqlite3.Database(pbydb);
    newDb.close();
}

// Open the DB
const db = new sqlite3.Database(pbydb, err => {
    if (err) {
        console.error(`Error opening DB: ${err.message}`);

        return;
    }

    console.log(`DB opened successfully`);

    return;
});

const app = express();
app.use(bodyParser.json());
app.use(morgan(logLevel));

app.get(`${apiBase}/status`, (req, res, next) => {
    return res.status(200).send('OK');
});

// Get list of tables
app.get(`${apiBase}/table/:id?`, (req, res, next) => {
    let sql = 'select * from tables';
    if (req.params.id) {
        sql += ` where id = ${req.params.id}`;
    }

    db.all(sql, (err, rows) => {
        if (err) {
            console.error(`DB error: ${err.message}`);

            if (err.message.includes('no such table')) {
                return createGameTable(res);
            }

            return res.status(500).send(err.message);
        }

        return res.send(rows);
    })
});

// Add games from PBY DB
app.post(`${apiBase}/import`, (req, res, next) => {
    fs.readFile(vpxDbFile, (err, data) => {
        if (err) {
            console.error(`FS error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        return new Promise((resolve, reject) => {
            // Handle data
            parseString(data, (xerr, parsed) => {
                if (xerr) {
                    console.error(`XML parse error: ${xerr.message}`);

                    reject(res.status(500).send(xerr.message));
                }

                console.log('parse OK');

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
insert into tables (name, description, type, rom, manufacturer, year, rating, ipdbid)
values ("${obj.name}", "${obj.description}", "${obj.type}", "${obj.rom}", "${obj.manufacturer}",
${obj.year}, ${obj.rating}, ${obj.ipdbid || null} )
on conflict (description) do update set name="${obj.name}", rom="${obj.rom}", rating=${obj.rating};`);

                    return obj;
                });

                // Execute SQL
                sql.unshift('begin;');
                sql.push('commit;');

                console.log(sql.join(' '));

                db.exec(sql.join(' '), err => {
                    if (err) {
                        console.error(`DB import error: ${err.message}`);

                        reject(err.message);
                    }
                })

                resolve(res.send(results));
            });
        });
    })
});

app.listen(port, () => {
    console.log(`API listening on port: ${port}`);
});

function createGameTable(res: express.Response) {
    db.exec(`create table tables (
                id integer primary key autoincrement,
                name text not null,
                description text not null unique,
                type text,
                rom text,
                manufacturer text not null,
                year integer not null,
                rating integer,
                ipdbid integer,
                vpsid text,
                b2s text,
                haspup integer
        )`, err => {
        if (err) {
            console.error(`DB create error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        return res.send([]);
    });
}
