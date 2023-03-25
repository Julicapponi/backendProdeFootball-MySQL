import mysql from "promise-mysql";
import createPool from "mysql";
import config from "./../config.js";

async function main(){
    const connection = await mysql.createPool({
        multipleStatements: true,
        connectionLimit: 100,
        host: config.host, 
        database: config.database, 
        user: config.user, 
        password: config.password 
    });
    console.log('Conexion base de datos exitosa');
}

export const getConnection = () => {
    main();
};




