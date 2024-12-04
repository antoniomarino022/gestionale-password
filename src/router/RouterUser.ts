import express from "express";
import { UserController } from "../controllers/ControllerUser";


export const routerUser = express.Router();
const userController = new UserController();

routerUser.delete("/clean", (req, res,next) => {
    userController.cleanTableUser(req, res,next);
});


routerUser.post("/register", (req, res, next) => {
    userController.registerUser(req, res, next);
});

routerUser.delete("/:idUser", (req, res, next) => {
    userController.deleteUser(req, res, next);
});





