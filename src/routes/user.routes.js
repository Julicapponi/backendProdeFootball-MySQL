import { Router } from "express";
import { methods as userController } from "./../controllers/user.controller.js";

const router = Router();

// usuarios
router.get("/", userController.getUsuarios);
router.get("/:id", userController.getUsuario);  
router.post("/", userController.addUsuario); 
router.put("/:id", userController.updateUsuario); 
router.delete("/:id", userController.deleteUsuario);
router.post("/signin/user/", userController.loginUsuario); 
export default router;
