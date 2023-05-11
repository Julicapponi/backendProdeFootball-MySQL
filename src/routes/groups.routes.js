import { Router } from "express";
import { methods as groupsController } from "./../controllers/groups.controller.js";
const router = Router();

// rutas grupo
router.post("/crear/", groupsController.addGroup); 
router.get("/reporte/", groupsController.obtenerReporteAciertos);
router.get("/:id", groupsController.gruposPorUser);
router.post("/postular/user/", groupsController.addPostularGroup);
router.post("/agregar/user/", groupsController.addUserGroup);
router.post("/borrar/postulacion/", groupsController.deletePostulacion);
router.post("/aceptar/postulante/", groupsController.aceptarPostulante);
router.post("/rechazar/postulante/", groupsController.rechazarPostulante);
router.get("/postulaciones/:idUser", groupsController.listPostulaciones);
router.get("/postulaciones/pendientes/:idUser", groupsController.listPostulacionesPendientes);
router.get("/listar/user/", groupsController.listUsersGroup);
router.get("/buscar/:nameGrupo/:idUser", groupsController.listGroupsBusqueda);
router.post("/salir/", groupsController.deleteUserGroup);
router.post("/eliminar/", groupsController.deleteGroup);
router.post("/editar/", groupsController.editGroup);
router.get("/puntajes/general/:idUser/:idGrupo/", groupsController.obtenerPuntajesGeneralPorUser);
router.get("/puntajes/fechas/:idGrupo/", groupsController.obtenerPuntajesPorFechaPorUser);
router.get("/competencia/:idGrupo/", groupsController.obtenerCompetenciaPorGrupo);
router.put("/:id", groupsController.updateGrupo); 
export default router;