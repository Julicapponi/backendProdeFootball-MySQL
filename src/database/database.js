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
    database: 'heroku_9da121ea22b70de',  
    user: 'b006be620c9751', 
    password: 'eb26edaf' 
});



export const getConnection = () => {
    return connection;
};


