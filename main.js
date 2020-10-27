const mysql = require('mysql2/promise');
require('dotenv').config();

class DB {
    constructor() {
        this.connection = null;
    }

    async connect(host) {
        this.connection = await mysql.createConnection({
            host,
            user: 'admin',
            password: 'passpass',
            database: 'test',
        });
    }

    async create(origin) {
        return this.connection.execute('INSERT INTO `users` (`first_name`, `last_name`, `origin`) VALUES (?, ?, ?)', ['Igor', 'Shulgin', origin]);
    }

    async read(id) {
        return this.connection.execute('SELECT * FROM `users` WHERE `id` = ?', [id]);
    }

    disconnect() {
        this.connection.close();
    }
}

(async () => {
    const instance = new DB();

    console.time(`DB Connection`);

    await instance.connect(process.env.HOST);

    console.timeEnd(`DB Connection`);

    console.time(`Executing INSERT`);

    let [{insertId}] = await instance.create(process.env.ORIGIN);

    console.timeEnd(`Executing INSERT`);

    console.time(`Executing SELECT`);

    await instance.read(insertId);

    console.timeEnd(`Executing SELECT`);

    instance.disconnect();

})();
