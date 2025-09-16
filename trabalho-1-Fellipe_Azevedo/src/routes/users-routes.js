import { Router } from "express";
import {
  criarUsuario,
  deleteUsuario,
  editarUsuario,
  exportarUsuariosCSV,
  listarUsuarios,
  mostraFormularioCadastro,
  mostraFormularioEdicao,
} from "../controller/users-controller.js";

const usersRouter = Router();

const respostaPadrao = (req, res) => {
  res.send("FUNCIONA");
};

usersRouter.get("/lista", listarUsuarios);

usersRouter.get("/criar", mostraFormularioCadastro);
usersRouter.post("/criar", criarUsuario);

usersRouter.get("/edit/:id", mostraFormularioEdicao);
usersRouter.post("/edit/:id", editarUsuario);

usersRouter.get("/delete/:id", deleteUsuario);

usersRouter.get("/export", exportarUsuariosCSV);

export { usersRouter };
