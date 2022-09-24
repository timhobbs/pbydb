import * as sqlite3 from 'sqlite3';

export const createConfigTable = (db: sqlite3.Database) => {
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
};

export const getConfiguration = async (db: sqlite3.Database): Promise<any> => {
    return new Promise((resolve) => {
        db.get('select * from config', (err, rows) => {
            if (err) {
                console.error(`DB get error: ${err.message}`);

                resolve({ error: err.message });
            }

            resolve(rows || { vpxdb: '', vpxtables: '' });
        });
    });
};
