import { Router } from "express";
import { methods as enfrentamientosController } from "./../controllers/enfrentamientos.controller.js";
const router = Router();

// rutas enfrentamientos
router.post("/guardar/pronostico/", enfrentamientosController.addPronostico); 
router.get("/pronosticados/:idComp/:idUser/", enfrentamientosController.getEnfrentamientosBDPronosticados);
router.get("/guardar/enfrentamientos/", enfrentamientosController.saveEnfrentamientosCompetenciasActivas); 
router.get("/list/:id/:anio/", enfrentamientosController.getEnfrentamientosApi);
router.get("/calcularPuntajes", enfrentamientosController.calcularPuntajes);
router.get("/:id/:anio/", enfrentamientosController.getEnfrentamientosBD);
router.put("/:id/", enfrentamientosController.editEnfrentamiento);
router.get("/tabla/posiciones/:idComp/:anio/", enfrentamientosController.getPositionTablePorComp);

export default router;