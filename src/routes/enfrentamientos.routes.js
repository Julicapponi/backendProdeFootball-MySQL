import { Router } from "express";
import { methods as enfrentamientosController } from "./../controllers/enfrentamientos.controller.js";
const router = Router();

// Competiciones
router.get("/guardar/enfrentamientos/", enfrentamientosController.saveEnfrentamientosCompetenciasActivas); 
router.get("/list/:id/:anio/", enfrentamientosController.getEnfrentamientosApi);
router.get("/:id/:anio/", enfrentamientosController.getEnfrentamientosBD);
export default router;