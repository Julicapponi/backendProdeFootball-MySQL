import mysql from "mysql2/promise";
import config from "./../config.js";
let pool;

export const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool({
      connectionLimit: 1000,
      multipleStatements: true,
      host: config.host,
      database: config.database,
      user: config.user,
      password: config.password,
      rowsAsArray: false,
      ssl: false,
      acquireTimeout: 6000000
    });

    pool.on('error', (err) => {
      console.error('Database connection error:', err);
      pool.end();
    });
  }

  const connection = await pool.getConnection();

  connection.on('error', (err) => {
    console.error('Database connection error:', err);
    connection.release();
  });

  return connection;
};