const mysql = require('mysql2/promise');
require('dotenv').config();

class DB {
    constructor() {
        this.readConnection = null;
        this.writeConnection = null;
        this.onMaster = false;
    }

    async connect(readHost, writeHost) {
        this.readConnection = await mysql.createConnection({
            host: readHost,
            user: 'admin',
            password: 'passpass',
            database: 'test',
        });

        if (readHost === writeHost) {
            this.writeConnection = this.readConnection;
            this.onMaster = true;
        } else {
            this.writeConnection = await mysql.createConnection({
                host: writeHost,
                user: 'admin',
                password: 'passpass',
                database: 'test',
            });
        }

    }

    async create(origin) {
        return this.writeConnection.execute('INSERT INTO `users` (`first_name`, `last_name`, `origin`) VALUES (?, ?, ?)', ['Igor', 'Shulgin', origin]);
    }

    async read(id) {
        return this.readConnection.execute('SELECT * FROM `users` WHERE `id` = ?', [id]);
    }

    disconnect() {
        this.readConnection.close();
        if (!this.onMaster) {
            this.writeConnection.close();
        }
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
