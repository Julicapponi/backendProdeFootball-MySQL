import { Router } from "express";
import { methods as groupsController } from "./../controllers/groups.controller.js";
const router = Router();

// Competiciones
router.post("/crear/", groupsController.addGroup); 
router.get("/:id", groupsController.gruposPorUser);
router.post("/postular/user/", groupsController.addPostularGroup);
router.post("/agregar/user/", groupsController.addUserGroup);
router.post("/borrar/postulacion/", groupsController.deletePostulacion);
router.post("/aceptar/postulante/", groupsController.aceptarPostulante);
router.post("/rechazar/postulante/", groupsController.rechazarPostulante);
router.get("/postulaciones/:idUser", groupsController.listPostulaciones);
router.get("/postulaciones/pendientes/:idUser", groupsController.listPostulacionesPendientes);
router.get("/listar/user/", groupsController.listUsersGroup);
router.get("/buscar/:nameGrupo", groupsController.listGroupsBusqueda);
router.post("/salir/", groupsController.deleteUserGroup);
router.post("/eliminar/", groupsController.deleteGroup);
router.post("/editar/", groupsController.editGroup);
export default router;