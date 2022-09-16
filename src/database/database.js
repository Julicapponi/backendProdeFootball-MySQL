import mysql from "promise-mysql";
import config from "./../config.js";

const connection = mysql.createConnection({
    /*
    host: config.host, 
    database: config.database, 
    user: config.user, 
    password: config.password 
*/
    //BD HEROKU
    host: 'us-cdbr-east-06.cleardb.net',
    database: 'heroku_1e935464b510891', 
    user: 'b97f768dd64fe5', 
    password: '6b2f98f2' 
});


export const getConnection = () => {
    return connection;
};


