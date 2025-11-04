import { Router } from "express";
import { UserController } from "../controller/user-controller.js";

const router = new Router();
const userController = new UserController();

router.post("/signup", userController.create.bind(userController));
router.post("/login", userController.login.bind(userController));
router.post("/logout", userController.logout.bind(userController));

export default router;
