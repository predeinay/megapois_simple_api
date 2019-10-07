const ConnectionPool = require('tedious-connection-pool');
const Request = require('tedious').Request, TYPES = require('tedious').TYPES;
const conf = require('../conf');

class MSDB {

    constructor() {

        const poolConfig = {
            min: conf.dbPoolMin,
            max: conf.dbPoolMax,
            log: true
        };

        const connectionConfig = {
            userName: conf.dbUser,
            password: conf.dbPass,
            server: conf.dbHost,
            options : {
                database : conf.dbName,
                rowCollectionOnRequestCompletion : true,
                rowCollectionOnDone : true,
		dateFormat : "dmy"
            }
        };

        // Создаем пул соединений к СУБД
        this.pool = new ConnectionPool(poolConfig, connectionConfig,{dateFormat:"dmy"});

        this.pool.on('error', (err) => {
            console.error(err);
        });
    }

    exec(sql, params, cb = () => {}) {

        this.pool.acquire( (err,connection) => {
            
            if (err) {
                console.error(err);
                cb(err);
                return;
            }

            const request = new Request(sql, (err, rowCount, rows) => {
                if (err) {
                    console.error(err);
		    connection.release();
                    cb(err);
                    return;
                }

                // Когда закончили работу надо вернут соединение в пул
                connection.release();
               
                // Жесть от майкрософта 
                const data = rows.map( (currentValue, index, array) => {
                    const row = {};
                    // Формируем нормальную структуру данных согласно метаданным
                    for (const col of currentValue) {
                        row[col.metadata.colName] = col.value; 
                    }
                    return row;
                } );
                

                cb(err, rowCount, data);
            });
        
            for (const param of params) {
                // С типами данных не запариваемся - считаем что их всего 2
                // С учетом что мы работаем с JSON
                const msType = (typeof param.value === 'string' || param.value instanceof String)
                                 ? TYPES.NVarChar : TYPES.Int;
                request.addParameter(param.name, msType, param.value);
            }

            connection.execSql(request);
        })

    }

}

module.exports = new MSDB();