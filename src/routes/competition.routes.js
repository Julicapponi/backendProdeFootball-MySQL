import { Router } from "express";
import { methods as competitionController } from "./../controllers/competition.controller.js";
import fetch from "node-fetch";
const router = Router();

//Rutas competiciones
router.get("/", competitionController.getCompetitions);
router.get("/:id", competitionController.getCompetition);  
router.get("/list/activas/", competitionController.getCompetitionsActivas); 

// agregar y borrar es sinonimo de activar y desactivar | Competencia activa/visible para el usuario.
router.post("/", competitionController.addCompetition);
router.delete("/:idcompetition", competitionController.deleteCompetition);  
router.put("/:id", competitionController.updateCompetition); 



export default router;