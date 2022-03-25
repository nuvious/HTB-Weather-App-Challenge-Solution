/**
 * This was just my sqlite3 playground I used to craft my sql injection
 * payload.
 */

const sqlite = require("sqlite3");

var db = new sqlite.Database("test.db");

db.exec(`
            DROP TABLE IF EXISTS users;

            CREATE TABLE IF NOT EXISTS users (
                id         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                username   VARCHAR(255) NOT NULL UNIQUE,
                password   VARCHAR(255) NOT NULL
            );

            INSERT INTO users (username, password) VALUES ('admin', 'qwer');
        `);

db.run(`INSERT INTO users (username, password) VALUES ('admin', 'admin') \
        ON CONFLICT(username) DO UPDATE SET password='admin'`);
 