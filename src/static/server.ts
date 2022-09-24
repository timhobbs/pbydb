import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as iconv from 'iconv-lite';
import * as morgan from 'morgan';
import * as sqlite3 from 'sqlite3';

import { createConfigTable, getConfiguration } from './config';
import { createStatsTable, getStats, importStats } from './stats';
import { createTablesTable, getTables, importVpx, updateTables } from './tables';
import { createTablestatsView, deleteById, dropTable, executeSql, getTableList } from './db';
import { createVpslookupTable, importVpslookup } from './vpslookup';

import { Builder } from 'xml2js';
import { Server } from 'socket.io';
import { getVpsdb } from './vps';
import { updateAllRoms } from './rom';

const apiBase = `/api`;
const port = 3030;
const pbydbPath = `${__dirname}/assets/db`;
const pbydb = `${pbydbPath}/pbydb.db`;
const logLevel = 'dev';

let vpsData: any;

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

    // Create views
    createTablestatsView(db);

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

app.get(`${apiBase}/status`, (req, res, next) => res.status(200).send('OK'));

// Get list of tables or table detail
app.get(`${apiBase}/table/:id?`, (req, res, next) =>
    getTables(db, req.params.id)
        .then(rows => res.send(rows))
        .catch(err => res.status(500).send(err.message))
);

// Update table
app.post(`${apiBase}/table/:id`, (req, res, next) =>
    updateTables(db, req.body, req.params.id)
        .then(status => res.send(status))
        .catch(err => res.status(500).send(err.message))
);

// Add games from PBY DB
app.post(`${apiBase}/import/:type?`, async (req, res, next) => {
    switch (req.params.type) {
        case 'vps':
            return await importVpslookup(req, res, db, io);
        case 'vpx':
            return await importVpx(res, db);
        case 'stats':
            return await importStats(res, db, io);
        default:
            return res.status(500);
    }
});

// Export to PBY DB
app.post(`${apiBase}/export`, async (req, res, next) => {
    const { vpxdb, error } = await getConfiguration(db);
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
    const results = await getConfiguration(db);
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
        return res.send(await getTableList(db));
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
app.post(`${apiBase}/sql`, async (req, res, next) =>
    executeSql(db, req.body.sql)
        .then(rows => res.send(rows))
        .catch(err => res.status(500).send(err.message))
);

// Execute delete
app.delete(`${apiBase}/delete/:table/:id`, async (req, res, next) =>
    deleteById(db, req.params.table, req.params.id)
        .then(rows => res.send(rows))
        .catch(err => res.status(500).send(err.message))
);

// Drop table
app.delete(`${apiBase}/drop/:table`, async (req, res, next) =>
    dropTable(db, req.params.table)
        .then(rows => res.send(rows))
        .catch(err => res.status(500).send(err.message))
);

// Stats
app.get(`${apiBase}/stats`, (req, res, next) => getStats(req, res, next, db));

// Get VPS data
app.get(`${apiBase}/vpsdata/:vpsid?`, async (req, res, next) => {
    const vpsid = req.params.vpsid;
    // Get data
    const data = await getVpsdb(vpsData);

    // Return all data if no id param
    if (!vpsid) {
        return res.send(data);
    }

    // Find match
    const match = data.filter((datum: any) => (datum.tableIds || []).includes(vpsid))

    return res.send(match);
});

// Clear VPS cached data
app.delete(`${apiBase}/vpsdata`, async (req, res, next) => {
    vpsData = void 0;

    return res.send({});
});

// Update all roms
app.post(`${apiBase}/rom/:name?`, async (req, res, next) => {
    if (!req.params.name) {
        await updateAllRoms(db);
    }

    return res.send({});
});
