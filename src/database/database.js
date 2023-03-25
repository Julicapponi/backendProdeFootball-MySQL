import mysql from "promise-mysql";
import config from "./../config.js";

const connection = mysql.createPool({
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    multipleStatements: true,
    host: config.host, 
    database: config.database, 
    user: config.user, 
    password: config.password,
    port: config.port
});



export const getConnection = () => {
return connection;
};