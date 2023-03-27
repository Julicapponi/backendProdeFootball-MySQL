import mysql from "mysql2/promise";
import config from "./../config.js";

const connection = mysql.createPool({
    connectionLimit: 1000,
    multipleStatements: true,
    host: config.host, 
    database: config.database, 
    user: config.user, 
    password: config.password,
    rowsAsArray: false,
});


export const getConnection = () => {
return connection;
};

