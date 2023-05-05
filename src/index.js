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

    //se ejecuta la tarea programada para guardar enfrentamientos de partidos todos los dias a las 23 hs.
    cron.schedule('0 23 * * *', () => {
        //methods.saveEnfrentamientosCompetenciasActivas();
    });

    //cada 30 minutos
    cron.schedule('0 */3 * * *', () => {
      //  methods.calcularPuntajes();;
    });
/*
    // cada 1 hora
    cron.schedule('0 * * * *', () => {

    // cada 2 horas

    // a las 00 todos los dias
    cron.schedule('0 0 * * *', () => {
    });

*/
   
};

main();
