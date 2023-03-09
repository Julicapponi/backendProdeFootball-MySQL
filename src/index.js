import app from "./app.js";
import cron from "node-cron";
import {methods} from "./controllers/enfrentamientos.controller.js";

const main = () => {
    app.listen(app.get("port"),app.get("host"));
    console.log(`Server on port ${app.get("port")} en el host ${app.get("host")}`);
/*

        //methods.saveEnfrentamientosCompetenciasActivas();
   
    
/*

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
