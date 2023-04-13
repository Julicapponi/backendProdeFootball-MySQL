//import mysql from "mysql2/promise";
import mysql from "promise-mysql";
import config from "./../config.js";

const connection = mysql.createPool({
        
  multipleStatements: true,
  connectionLimit: 100,
  host: config.host, 
  database: config.database, 
  user: config.user, 
  password: config.password 
});

export const getConnection = () => {
return connection;
};