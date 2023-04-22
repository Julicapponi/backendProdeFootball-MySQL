import { Router } from "express";
import { methods as competitionController } from "./../controllers/competition.controller.js";
import fetch from "node-fetch";
const router = Router();

//Rutas competiciones
router.get("/", competitionController.getCompetitionsApi); 
router.get("/list/altas/", competitionController.getCompetitionsAltasBD); 
router.post("/", competitionController.addCompetition);
router.get("/list/activas/", competitionController.getCompetitionsActivas); 
router.delete("/:idcompetition", competitionController.deleteCompetition);  
router.put("/:id", competitionController.updateCompetition); 
router.put("/estado/:id", competitionController.estadoCompetition); 

export default router;