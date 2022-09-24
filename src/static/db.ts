import * as sqlite3 from 'sqlite3';

export const getTableList = (db: sqlite3.Database) => {
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
};

export const createTablestatsView = (db: sqlite3.Database) => {
    // Create view
    db.exec(
        `create view tablestats as
        select * from tables inner join stats
        where tables.name = stats.gamename`,
        (err) => {
            if (err) {
                console.error(`DB create error: ${err.message}`);

                throw err;
            }
        }
    );
};

export const executeSql = (db: sqlite3.Database, sql: string) =>
    new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(`DB error: ${err.message}`);

                reject(err.message);
            }

            resolve(rows);
        });
    });

export const deleteById = (db: sqlite3.Database, table: string, id: string) =>
    new Promise((resolve, reject) => {
        db.all(`delete from ${table} where id = ${id}`, (err, rows) => {
            if (err) {
                console.error(`DB delete error: ${err.message}`);

                reject(err.message);
            }

            resolve(rows);
        });
    });

export const dropTable = (db: sqlite3.Database, table: string) =>
    new Promise(async (resolve, reject) => {
        try {
            const tables = await getTableList(db) as any[];
            const table: any = tables.find((tableInfo) => {
                return tableInfo.name === table;
            });

            const sql: string[] = [
                `drop table ${table.name}`,
                table.sql
            ];

            if (table.name === 'config') {
                sql.push(`insert into config ( vpxdb, vpxtables ) values ('', '')`);
            }

            db.exec(sql.join('; '), (err) => {
                if (err) {
                    console.error(`DB delete error: ${err.message}`);

                    reject(err.message);
                }

                resolve({});
            });
        } catch (error: any) {
            reject(error.message);
        }
    });
