import express  from "express";
import { ControllerAuth } from "../controllers/ControllerAuth";

export const routerAuth = express.Router();
const controllerAuth = new ControllerAuth();


routerAuth.delete("/clean", (req, res,next)=>{
    controllerAuth.cleanTableAuth(req, res,next);
})


routerAuth.post("/login", (req, res,next)=>{
    controllerAuth.login(req, res,next);
})


routerAuth.delete("/logout",(req, res,next)=>{
    controllerAuth.logout(req, res,next);
})