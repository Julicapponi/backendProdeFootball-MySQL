import { Router } from "express";
import { methods as groupsController } from "./../controllers/groups.controller.js";
const router = Router();

// Competiciones
router.post("/crear/", groupsController.addGroup); 
router.get("/:id", groupsController.gruposPorUser);
router.post("/agregar/user/", groupsController.addUserGroup);
router.get("/listar/user/", groupsController.listUsersGroup);
router.get("/buscar/:nameGrupo", groupsController.listGroupsBusqueda);
router.post("/salir/", groupsController.deleteUserGroup);
router.post("/eliminar/", groupsController.deleteGroup);
export default router;