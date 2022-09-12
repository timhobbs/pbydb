import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as iconv from 'iconv-lite';
import * as morgan from 'morgan';
import * as sqlite3 from 'sqlite3';

import { Builder, parseString } from 'xml2js';
import { NextFunction, Request, Response } from 'express';

import { Server } from 'socket.io';
import { default as axios } from 'axios';
import { parse as parseSync } from 'csv-parse/sync';

const apiBase = `/api`;
const port = 3030;
const pbydbPath = `${__dirname}/assets/db`;
const pbydb = `${pbydbPath}/pbydb.db`;
const logLevel = 'dev';
const vpsDbUrl = `https://fraesh.github.io/vps-db/vpsdb.json?ts=${Date.now()}`;

// ****************************************************************************
// DB Init
// ****************************************************************************

// Check for proper folders
if (!fs.existsSync(pbydbPath)) {
    fs.mkdirSync(pbydbPath, { recursive: true });
}

// Create the DB if it doesn't exist
if (fs.existsSync(pbydb) === false) {
    const newDb = new sqlite3.Database(pbydb);
    newDb.close();

    // Open DB
    const db = new sqlite3.Database(pbydb, (err) => {
        if (err) {
            console.error(`Error opening DB: ${err.message}`);

            return;
        }

        console.log(`DB opened successfully`);

        return;
    });

    // Create tables
    createConfigTable(db);
    createTablesTable(db);
    createVpslookupTable(db);
    createStatsTable(db);

    // Close DB
    db.close();

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

// ****************************************************************************
// Server init
// ****************************************************************************

const app = express();
app.use(bodyParser.json());
app.use(morgan(logLevel));
const httpServer = new http.Server(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

httpServer.listen(port, () => {
    console.log(`API listening on port: ${port}`);
});

// ****************************************************************************
// Routes
// ****************************************************************************

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

            return res.status(500).send(err.message);
        }

        return res.send(rows);
    });
});

// Update table
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
            return await importVpslookup(req, res);
        case 'vpx':
            return await importVpx(res);
        case 'stats':
            return await importStats(res);
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
vpxtables = '${req.body.vpxtables}',
vpxstats = '${req.body.vpxstats}'
where id = 1`;

    db.run(sql, (err) => {
        if (err) {
            console.error(`DB update error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        return res.send(true);
    });
});

// Get database table list
app.get(`${apiBase}/db`, async (req, res, next) => {
    try {
        return res.send(await getTableList());
    } catch (error: any) {
        return res.status(500).send(error.message);
    }
});

// Get VPS lookup
app.get(`${apiBase}/vpslookup/:id?`, async (req, res, next) => {
    let sql = 'select * from vpslookup';
    if (req.params.id) {
        sql += ` where id = ${req.params.id}`;
    }

    db.all(sql, (err, rows) => {
        if (err) {
            console.error(`DB error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        return res.send(rows);
    });
});

// Execute SQL
app.post(`${apiBase}/sql`, async (req, res, next) => {
    db.all(req.body.sql, (err, rows) => {
        if (err) {
            console.error(`DB error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        return res.send(rows);
    });
});

// Execute delete
app.delete(`${apiBase}/delete/:table/:id`, async (req, res, next) => {
    db.all(`delete from ${req.params.table} where id = ${req.params.id}`, (err, rows) => {
        if (err) {
            console.error(`DB delete error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        return res.send(rows);
    });
});

// Drop table
app.delete(`${apiBase}/drop/:table`, async (req, res, next) => {
    try {
        const tables = await getTableList() as any[];
        const table: any = tables.find((tableInfo) => {
            return tableInfo.name === req.params.table;
        });

        const sql: string[] = [
            `drop table ${table.name}`,
            table.sql
        ];

        if (table.name === 'config') {
            sql.push(`insert into config ( vpxdb, vpxtables ) values ('', '')`);
        }

        return db.exec(sql.join('; '), (err) => {
            if (err) {
                console.error(`DB delete error: ${err.message}`);

                return res.status(500).send(err.message);
            }

            return res.send({});
        });
    } catch (error: any) {
        return res.status(500).send(error.message);
    }
});

// Stats
app.get(`${apiBase}/stats`, getStats);

// ****************************************************************************
// Methods
// ****************************************************************************

function getTableList() {
    return new Promise((resolve, reject) => {
        const sql = `
select * from sqlite_schema
where type = 'table' and name not like 'sqlite_%'`;

        db.all(sql, (err, rows) => {
            if (err) {
                console.error(`DB error: ${err.message}`);

                return reject(err.message);
            }

            return resolve(rows);
        });
    });
}

function createTablesTable(db: sqlite3.Database) {
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
}

function createConfigTable(db: sqlite3.Database) {
    // Create table
    db.exec(
        `create table config (
            id integer primary key autoincrement,
            vpxdb text,
            vpxtables text,
            vpxstats text
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
}

function createVpslookupTable(db: sqlite3.Database) {
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
}

function createStatsTable(db: sqlite3.Database) {
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
}

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

async function importVpslookup(req: express.Request, res: express.Response) {
    const { data } = await axios.get(vpsDbUrl).then(db => db);
    const vpxTables = data.filter((table: any) => table.features.includes('VPX'));
    const lookupData = getVpslookupData(vpxTables);
    console.log('***** lookupData.length', lookupData.length);

    await updateVpslookupTable(lookupData);
    const result = { total: lookupData.length };

    return res.send(result);

}

function updateVpslookupTable(data: string[][]) {
    return importFromCsv('vpslookup', data);
}

function importFromCsv(tableName: string, data: string[][]) {
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
}

function getStats(req: Request, res: Response, next: NextFunction) {
    db.all('select * from stats', async (err, rows) => {
        if (err) {
            console.error(`DB get error: ${err.message}`);

            return res.status(500).send(err.message);
        }

        console.log('***** rows', rows.length);

        return res.send(rows);
    });
}

async function importStats(res: Response) {
    const { vpxstats, error } = await getConfiguration();
    if (!vpxstats) {
        return res.status(500).send(error);
    }

    try {
        return new Promise(async (resolve, reject) => {
            const data = await parseCsv(vpxstats, 'utf16le', 'windows-1252');
            await importFromCsv('stats', data)
            const result = { total: data.length };
            resolve(result);
        });
    } catch (err: any) {
        return res.status(500).send(err);
    }
}

function parseCsv(filename: string, readEncoding: BufferEncoding = 'utf8', encoding: string = 'utf8') {
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
}

// ****************************************************************************
// From vps app
// ****************************************************************************

function getVpslookupData(r: any[]) {
    const ho = ["GameFileName", "GameName", "GameDisplay", "MediaSearch", "Manufact", "GameYear", "NumPlayers", "GameType", "Category", "GameTheme", "WebLinkURL", "IPDBNum", "AltRunMode", "DesignedBy", "Author", "GAMEVER", "Rom", "Tags", "VPS-ID"];
    const t = { theAtEnd: true, author: true, version: true, mod: true, ssf: true, vr: true };
    let n = [ho];
    r.sort((o,a)=>a.name > o.name ? -1 : 1)
    .forEach(o=>{
        let a: any[];
        (a = getGameFileName(o, t)) == null || a.forEach(([i, l])=>{
            let h, x, g, p, C, b;
            const d = getGameFileName(o, {
                theAtEnd: t.theAtEnd
            })[0][0];
            const u = [`${l.gameFileName || i}`, `${d}`, `${d}`, "", o.manufacturer || "", ((h = o.year) == null ? void 0 : h.toString()) || "", ((x = o.players) == null ? void 0 : x.toString()) || "", o.type || "", "", arrayToString(o.theme), ((g = o.ipdbUrl) == null ? void 0 : g.includes(".ipdb.org/machine.cgi?id=")) ? `"${o.ipdbUrl}"` : "", ((p = o.ipdbUrl) == null ? void 0 : p.includes(".ipdb.org/machine.cgi?id=")) ? o.ipdbUrl.split(".cgi?id=")[1] : "", "", arrayToString(o.designers), arrayToString(l.authors), l.version || "", ((C = o.romFiles) == null ? void 0 : C.length) && o.romFiles[0].version || "", arrayToString((b = l.features) == null ? void 0 : b.filter((w: any)=>!["incl. B2S", "incl. ROM", "incl. Art", "incl. PuP", "incl. Video", "no ROM"].includes(w))), l.id];
            n.push(u)
        });
    });

    return n;
}

function getGameFileName(r: any, t: any) {
    let o;
    let n = r.name;
    return t.theAtEnd && r.name.slice(0, 4).toLowerCase() === "the " && (n = `${n.slice(4).trim()}, The`),
    ((o = r.tableFiles) == null ? void 0 : o.map((a: any)=>{
        let i, l, d, u;
        return [`${n} (${r.manufacturer} ${r.year})${t.author && ((i = a.authors) == null ? void 0 : i.length) ? ` ${a.authors[0]}` : ""}${t.version ? ` ${a.version || ""}` : ""}${t.ssf && ((l = a.features) == null ? void 0 : l.includes("SSF")) ? " SSF" : ""}${t.mod && ((d = a.features) == null ? void 0 : d.includes("MOD")) ? " MOD" : ""}${t.vr && ((u = a.features) == null ? void 0 : u.includes("VR")) ? " VR" : ""}`, a]
    })) || []
}

function arrayToString(r: any) {
    (r == null ? void 0 : r.length) ? `"${r.join(", ")}"` : "";
}
