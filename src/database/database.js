import mysql from "mysql2/promise";
import config from "./../config.js";
export let connection;

try {
  connection = mysql.createConnection({
    connectionLimit: 1000,
    multipleStatements: true,
    host: config.host, 
    database: config.database, 
    user: config.user, 
    password: config.password,
    rowsAsArray: false,
    ssl: false,
    acquireTimeout:6000000
  });
  console.log("Connection to database successful.");
} catch (error) {
  console.error("Error connecting to database: ", error.message);
}

export const getConnection = () => {
  if (!connection) {
    console.error("No connection to database.");
    console.log(connection.error);
    console.log(connection);
  }
  return connection;
};