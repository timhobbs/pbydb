import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import * as morgan from 'morgan';
import * as sqlite3 from 'sqlite3';

import { Builder, parseString } from 'xml2js';

import { Response } from 'express';

// const vpxDbFile = `/mnt/f/Games/PinballY/Databases/Visual Pinball X/Visual Pinball X.xml`;
// vps-db URL: https://fraesh.github.io/vps-db/vpsdb.json?ts=1661146191805
// weeks URL: https://virtualpinballchat.com:6080/api/v1/weeks
const apiBase = `/api`;
const port = 3030;
const pbydb = 'src/static/db/pbydb.db';
const logLevel = 'dev';

// Create the DB if it doesn't exist
if (fs.existsSync(pbydb) === false) {
    const newDb = new sqlite3.Database(pbydb);
    newDb.close();

    // Create config table
    createConfigTable();
}

// Open the DB
const db = new sqlite3.Database(pbydb, (err) => {
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

// Get list of tables or table detail
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
    });
});

app.post(`${apiBase}/table/:id`, (req, res, next) => {
    const sql = `
update tables set
type = '${req.body.type}',
rom = '${req.body.rom}',
rating = ${req.body.rating},
vpsid = '${req.body.vpsid}',
b2s = '${req.body.b2s}',
haspup = ${req.body.haspup === true ? 1 : 0}
where id = ${req.params.id}`;

    db.run(sql, (err) => {
        if (err) {
            console.error(`DB update error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        return res.send(true);
    });
});

// Add games from PBY DB
app.post(`${apiBase}/import/:type?`, async (req, res, next) => {
    switch (req.params.type) {
        case 'vps':
            return res.status(501);
        case 'vpx':
            return await importVpx(res);
        default:
            return res.status(500);
    }
});

// Export to PBY DB
app.post(`${apiBase}/export`, async (req, res, next) => {
    const { vpxdb, error } = await getConfiguration();
    if (!vpxdb) {
        res.status(500).send(error);
    }

    db.all('select * from tables order by description', (err, rows) => {
        if (err) {
            console.error(`DB export error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        const mappedRows = rows.map((row) => {
            row['$'] = { name: row.name };
            delete row.name;

            // Reset undefined values
            Object.entries(row).forEach(([key, value]) => {
                if (value === void 0) {
                    row[key] = '';
                }
            });

            return row;
        });
        const builder = new Builder({
            headless: true,
            renderOpts: {
                pretty: true,
                indent: '    ',
                newline: '\n',
            },
        });

        // Create and encode xml
        const xml = iconv.encode(
            builder.buildObject({ menu: { game: mappedRows } }),
            'windows-1252'
        );

        // Rename xml
        fs.renameSync(vpxdb, `${vpxdb}.backup`);

        // Save updated xml
        fs.writeFileSync(vpxdb, xml, 'binary');

        return res.send(rows);
    });
});

// Get config
app.get(`${apiBase}/config`, async (req, res, next) => {
    const results = await getConfiguration();
    if (!results) {
        return res.status(500).send('Error accessing config');
    }

    if (results.length && results[0].error) {
        return res.status(500).send(results.error);
    }

    return res.send(results);
});

// Update config
app.post(`${apiBase}/config`, (req, res, next) => {
    const sql = `
update config set
vpxdb = '${req.body.vpxdb}',
vpxtables = '${req.body.vpxtables}'
where id = 1`;

    db.run(sql, (err) => {
        if (err) {
            console.error(`DB update error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        return res.send(true);
    });
});

app.listen(port, () => {
    console.log(`API listening on port: ${port}`);
});

async function importVpx(res: Response) {
    const { vpxdb, error } = await getConfiguration();
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

                console.log(sql.join(' '));

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
}

function createGameTable(res: express.Response) {
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

                return res.status(500).send(err.message);
            }

            return res.send([]);
        }
    );
}

function createConfigTable() {
    // Open DB
    const db = new sqlite3.Database(pbydb, (err) => {
        if (err) {
            console.error(`Error opening DB: ${err.message}`);

            return;
        }

        console.log(`DB opened successfully`);

        return;
    });

    // Create table
    db.exec(
        `create table config (
            id integer primary key autoincrement,
            vpxdb text,
            vpxtables text
        )`,
        (err) => {
            if (err) {
                console.error(`DB create error: ${err.message}`);

                throw err;
            }
        }
    );

    // Add row
    db.exec(
        `insert into config ( vpxdb, vpxtables )
        values ('', '')`,
        (err) => {
            if (err) {
                console.error(`DB insert error: ${err.message}`);

                throw err;
            }
        }
    );


    // Close DB
    db.close();
}

async function getConfiguration(): Promise<any> {
    return new Promise((resolve) => {
        db.get('select * from config', (err, rows) => {
            if (err) {
                console.error(`DB get error: ${err.message}`);

                resolve({ error: err.message });
            }

            resolve(rows || { vpxdb: '', vpxtables: '' });
        });
    });
}

function importVpsData(csvPath: string) {

}

function createVpsTable(db: sqlite3.Database) {
    const sql = `
create table vpslookup
    id integer primary key autoincrement,
    GameFileName text not null unique,
    GameName text,
    GameDisplay text,
    MediaSearch text,
    Manufact,
    GameYear,
    NumPlayers,
    GameType,
    Category,
    GameTheme,
    WebLinkURL,
    IPDBNum,
    AltRunMode,
    DesignedBy,
    Author,
    GAMEVER,
    Rom,
    Tags,
    VPS-ID`;

    // Create table
    db.exec(
        `create table config (
            id integer primary key autoincrement,
            vpxdb text,
            vpxtables text
        )`,
        (err) => {
            if (err) {
                console.error(`DB create error: ${err.message}`);

                throw err;
            }
        }
    );
}
