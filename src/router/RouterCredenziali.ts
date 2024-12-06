import express from "express";
import { modelCredenziali } from "../models/ModelCredenziali";


export const routerCredenziali = express.Router();

routerCredenziali.post("/registerPassword",(req, res, next) => {
  modelCredenziali.registerPassword(req, res, next);
});
