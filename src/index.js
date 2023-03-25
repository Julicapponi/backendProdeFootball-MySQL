import app from "./app.js";
import cron from "node-cron";
import {methods} from "./controllers/enfrentamientos.controller.js";
import { getConnection } from "./database/database.js";

const main = async () => {
    app.listen(app.get("port"), () =>{
        console.log(`Server in host ${app.get("host")} o on port ${app.get("port")} `);
    });
      
    app.get('/', (req, res) => {
        res.send('hello World!');
    })
    
    // dejarlo sino en el server devuelve este error 404, si no encuentra nada devuelve 204.
    app.use((req, res, next) => {
        if (req.url === '/favicon.ico') {
          res.status(204).end();
        } else {
          next();
        }
    });

    const connection = await getConnection();

/*

        //methods.saveEnfrentamientosCompetenciasActivas();
   
    


    cron.schedule("* * * * * *", () => {
        console.log("La tarea programada cada 1 segundo se ha ejecutado");

    });

    cron.schedule('0 0 * * *', () => {
        console.log("La tarea programada de las 00:00 horas se ha ejecutado");
    });

    cron.schedule('0 23 * * *', () => {
        console.log("La tarea programada de las 23:00 horas se ha ejecutado");
    });
*/
   
};

main();
