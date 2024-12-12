import express from "express";
import { modelCredenziali } from "../models/ModelCredenziali";


export const routerCredenziali = express.Router();


routerCredenziali.delete("/clean",(req, res, next) => {
  modelCredenziali.cleanTableCredenziali(req, res, next);
});

routerCredenziali.post("/register-password/:idUser",(req, res, next) => {
  modelCredenziali.registerPassword(req, res, next);
});
