import { Router } from "express";
import { methods as enfrentamientosController } from "./../controllers/enfrentamientos.controller";
const router = Router();

// Competiciones
router.get("/", enfrentamientosController.getEnfrentamientos); //     /obtener/enfrentamientos/:id/:anio
router.get("/:id/:anio/", enfrentamientosController.getEnfrentamientosCompetition); 

export default router;