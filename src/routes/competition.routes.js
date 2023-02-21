import { Router } from "express";
import { methods as competitionController } from "./../controllers/competition.controller.js";
import fetch from "node-fetch";
const router = Router();

// Competiciones

//Lista de todas las competiciones
router.get("/", competitionController.getCompetitions);
router.get("/:id", competitionController.getCompetition);  
router.get("/list/activas/", competitionController.getCompetitionsActivas); 

// add y delete es sinonimo de activar y desactivar competencia activa/visible para el usuario.
router.post("/", competitionController.addCompetition);
router.delete("/:id", competitionController.deleteCompetition);  
router.put("/:id", competitionController.updateCompetition); 



export default router;